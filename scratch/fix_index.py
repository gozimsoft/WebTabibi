with open('backend/index.php', 'rb') as f:
    c = f.read()

bad = b"if ( === '/appointments/live-queue-status' &&  === 'GET') {"
good = b"if ($uri === '/appointments/live-queue-status' && $method === 'GET') {"
assert bad in c, "bad not found"
c = c.replace(bad, good)

bad2 = b"if (isset([0]) && [0] === 'appointments' && isset([1]) && ([2] ?? '') === 'queue-status' &&  === 'PUT') {"
good2 = b"if (isset($parts[0]) && $parts[0] === 'appointments' && isset($parts[1]) && ($parts[2] ?? '') === 'queue-status' && $method === 'PUT') {"
assert bad2 in c, "bad2 not found"
c = c.replace(bad2, good2)

bad3 = b"AppointmentController::updateQueueStatus([1]);"
good3 = b"AppointmentController::updateQueueStatus($parts[1]);"
assert bad3 in c, "bad3 not found"
c = c.replace(bad3, good3)

with open('backend/index.php', 'wb') as f:
    f.write(c)

print("Fixed backend/index.php successfully!")
