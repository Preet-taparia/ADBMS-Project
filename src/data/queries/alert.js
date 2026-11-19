const NOW = 'now';

const build = (opt) => {
  const userTest = opt
    ? '     AND ST_DWithin(u.current_location, ni.location, ni.radius)'
    : '     AND ST_Distance(u.current_location, ni.location) <= ni.radius';
  const officerJoin = opt
    ? 'JOIN new_incident ni ON ST_DWithin(a.current_location, ni.location, 15000)'
    : 'JOIN new_incident ni ON ST_Distance(a.current_location, ni.location) <= 15000';

  const sql = [
    'alerts AS (',
    '    INSERT INTO incident_alert (incident_id, user_id, distance_meters, severity, alert_message)',
    '    SELECT ni.incident_id, u.user_id,',
    '        ROUND(ST_Distance(u.current_location, ni.location)::numeric, 2),',
    '        ni.severity,',
    "        FORMAT('ALERT [%s]: Incident reported %s meters from your location. Description: %s',",
    '            UPPER(ni.severity::text),',
    '            ROUND(ST_Distance(u.current_location, ni.location)::numeric, 2),',
    "            COALESCE(LEFT(ni.incident_description, 100), 'Wildlife encounter reported'))",
    '    FROM alert_params ni',
    '    JOIN users u',
    '      ON u.user_id <> ni.reported_by',
    userTest,
    '    RETURNING alert_id',
    '),',
    'officer AS (',
    '    SELECT a.authority_id',
    '    FROM authority a',
    '    ' + officerJoin,
    '    WHERE a.available = TRUE',
    "      AND a.role = 'field_officer'",
    "      AND ni.severity IN ('high', 'critical')",
    '    ORDER BY ST_Distance(a.current_location, ni.location) ASC',
    '    LIMIT 1',
    '    FOR UPDATE OF a SKIP LOCKED',
    ')',
  ];

  const usersText = opt
    ? 'ST_DWithin lets the GiST index discard far users by bounding box before any exact distance is computed. User 1 is the reporter and is excluded, user 2 is about 23 km away and user 3 is about 1.7 km away.'
    : 'ST_Distance is computed for every user and then compared with the radius, so the spatial index cannot be used. User 1 is the reporter and is excluded, user 2 is about 23 km away and user 3 is about 1.7 km away.';
  const officerText = opt
    ? 'ST_DWithin limits officers to a 15 km neighbourhood through the index. Officer E is 800 m away and wins. Officers A and C are in range but farther. Officer B is unavailable and Manager D is not a field officer.'
    : 'Exact distance is computed for every officer before the 15 km comparison. Officer E is 800 m away and wins. Officers A and C are in range but farther. Officer B is unavailable and Manager D is not a field officer.';

  const steps = [
    { title: 'Report the critical incident', text: 'A critical incident is inserted 800 m northeast of Officer E, the first free field officer. Alerting, dispatch and history logging all happen inside one WITH statement.', tables: ['incident', 'authority'], r: { authority: [5] }, h: [], ops: [{ op: 'ins', t: 'incident', row: [6, 1, 1, 'critical', 'reported', '78.4853 17.4751', NOW, null, null, null] }] },
    { title: 'Radius from severity', text: 'The CASE in alert_params gives critical incidents a 10000 m radius.', tables: ['incident'], c: { incident: ['severity'] }, h: ['ni.radius'] },
    { title: 'Find users in range', text: usersText, tables: ['incident', 'users'], r: { users: [3] }, s: { users: [1, 2] }, c: { users: ['current_location'], incident: ['location'] }, h: [userTest.trim()] },
    { title: 'Write the alert', text: 'One incident_alert row is inserted for user 3 with the distance and a formatted message.', tables: ['incident', 'incident_alert', 'users'], r: { users: [3] }, h: ['INSERT INTO incident_alert'], ops: [{ op: 'ins', t: 'incident_alert', row: [3, 6, 3, 1710, 'critical', 'false', NOW] }] },
    { title: 'Choose the nearest officer', text: officerText, tables: ['authority', 'incident'], r: { authority: [5] }, s: { authority: [1, 2, 3, 4] }, c: { authority: ['available', 'role', 'current_location'] }, h: ['15000', 'LIMIT 1', 'FOR UPDATE OF a SKIP LOCKED'] },
    { title: 'Assign, mark unavailable, log history', text: 'The assignment, officer_update and officer_history steps are identical in both files. The officer is locked, assigned, set unavailable, and a history row is written in the same statement.', tables: ['response_assignment', 'authority', 'authority_history'], r: { authority: [5] }, ops: [{ op: 'ins', t: 'response_assignment', row: [5, 6, 5, NOW, 'assigned', null] }, { op: 'upd', t: 'authority', pk: 5, set: { available: 'false' } }, { op: 'ins', t: 'authority_history', row: [2, 5, 1, '78.48 17.47', 'false', NOW] }] },
    { title: 'Officer starts work', text: 'The assignment and the incident both move to in_progress.', tables: ['response_assignment', 'incident'], r: { incident: [6], response_assignment: [5] }, ops: [{ op: 'upd', t: 'response_assignment', pk: 5, set: { status: 'in_progress' } }, { op: 'upd', t: 'incident', pk: 6, set: { status: 'in_progress' } }] },
    { title: 'Complete, free and log', text: 'The assignment completes, the incident resolves, the officer becomes available again and a second history row is written.', tables: ['response_assignment', 'incident', 'authority', 'authority_history'], r: { incident: [6], authority: [5] }, ops: [{ op: 'upd', t: 'response_assignment', pk: 5, set: { status: 'completed', completed_at: NOW } }, { op: 'upd', t: 'incident', pk: 6, set: { status: 'resolved', resolved_at: NOW } }, { op: 'upd', t: 'authority', pk: 5, set: { available: 'true' } }, { op: 'ins', t: 'authority_history', row: [3, 5, 1, '78.48 17.47', 'true', NOW] }] },
  ];

  return { label: opt ? 'Optimized' : 'Unoptimized', sql, steps };
};

export default [
  {
    cat: 'Alert demo',
    title: 'Critical incident alert and dispatch',
    tag: 'ST_DWITHIN',
    compare: {
          "timing": { "before": 184203.5, "after": 41.2 },

      verdict: 'Only two predicates differ between the files. Both return the same alert and the same officer, but the optimized version lets PostGIS use spatial indexes to find users and officers.',
      rows: [
        { aspect: 'User range test', before: 'ST_Distance(...) <= radius, evaluated per user', after: 'ST_DWithin(..., radius), index assisted' },
        { aspect: 'Officer range test', before: 'ST_Distance(...) <= 15000, evaluated per officer', after: 'ST_DWithin(..., 15000), index assisted' },
        { aspect: 'Everything else', before: 'CTE chain, SKIP LOCKED, history logging', after: 'Identical' },
        { aspect: 'Result', before: '1 alert, Officer E dispatched', after: '1 alert, Officer E dispatched' },
      ],
    },
    cases: [build(false), build(true)],
  },
];