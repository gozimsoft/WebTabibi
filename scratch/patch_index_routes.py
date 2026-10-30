path = r'd:/Application Web/WebTabibi/backend/index.php'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

target = "        DoctorController::deleteOffHour($parts[2]);\n    }"
if target not in content:
    target = "        DoctorController::deleteOffHour($parts[2]);\r\n    }"

new_routes = """
    // ── Doctor Leaves & Unavailabilities ──────────────────────
    if (($uri === '/doctor/unavailabilities' || $uri === '/doctors/unavailabilities') && $method === 'GET') {
        require_once __DIR__ . '/controllers/DoctorController.php';
        DoctorController::getUnavailabilities();
    }
    if (($uri === '/doctor/unavailabilities/check-conflicts' || $uri === '/doctors/unavailabilities/check-conflicts') && $method === 'POST') {
        require_once __DIR__ . '/controllers/DoctorController.php';
        DoctorController::checkUnavailabilityConflicts();
    }
    if (($uri === '/doctor/unavailabilities' || $uri === '/doctors/unavailabilities') && $method === 'POST') {
        require_once __DIR__ . '/controllers/DoctorController.php';
        DoctorController::createUnavailability();
    }
    if (isset($parts[0]) && ($parts[0] === 'doctor' || $parts[0] === 'doctors') && isset($parts[1]) && $parts[1] === 'unavailabilities' && isset($parts[2]) && $method === 'DELETE') {
        require_once __DIR__ . '/controllers/DoctorController.php';
        DoctorController::deleteUnavailability($parts[2]);
    }"""

if target in content:
    replacement = target + (new_routes.replace('\n', '\r\n') if '\r\n' in target else new_routes)
    content = content.replace(target, replacement, 1)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS: Routes patched into index.php")
else:
    print("FAIL: Target not found")
