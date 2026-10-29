path = r'd:/Application Web/WebTabibi/backend/controllers/AppointmentController.php'
with open(path, 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Add helper methods before closing class brace
helper_methods = """
    public static function checkUnavailabilityConflict(string $doctorId, ?string $clinicId, string $appointmentDatetime, ?string $shiftType = null): ?array
    {
        $pdo = Database::getInstance();
        $date = substr($appointmentDatetime, 0, 10);

        $sql = "
            SELECT id, reason, show_reason_to_patient, leave_type, start_datetime, end_datetime, shift_type
            FROM doctor_unavailabilities
            WHERE doctor_id = ?
              AND (clinic_id = ? OR clinic_id IS NULL)
              AND (
                  (leave_type = 'full_day' AND DATE(?) >= DATE(start_datetime) AND DATE(?) <= DATE(end_datetime))
                  OR (leave_type = 'shift' AND DATE(?) = DATE(start_datetime) AND (shift_type = ? OR shift_type = 'full_day' OR ? = 'full_day' OR shift_type IS NULL))
                  OR (leave_type = 'partial_hours' AND ? >= start_datetime AND ? <= end_datetime)
              )
            LIMIT 1
        ";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $doctorId,
            $clinicId,
            $date, $date,
            $date, $shiftType, $shiftType,
            $appointmentDatetime, $appointmentDatetime
        ]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    private static function filterUnavailabilities(array $slots, string $date, array $unavailabilities, int $timescale): array
    {
        return array_values(array_filter($slots, function ($slot) use ($date, $unavailabilities, $timescale) {
            $slotStart = strtotime("$date $slot:00");
            $slotEnd   = $slotStart + ($timescale * 60);

            foreach ($unavailabilities as $u) {
                if ($u['leave_type'] === 'full_day') {
                    return false;
                }
                if ($u['leave_type'] === 'partial_hours') {
                    $uStart = strtotime($u['start_datetime']);
                    $uEnd   = strtotime($u['end_datetime']);
                    if ($slotStart < $uEnd && $slotEnd > $uStart) {
                        return false;
                    }
                }
            }
            return true;
        }));
    }
}
"""

if "function checkUnavailabilityConflict" not in code:
    code = code.rstrip()
    if code.endswith('}'):
        code = code[:-1] + helper_methods

# 2. Add unavailabilities check in getAvailableSlots
target_workingdays = """        if (strlen($workingdays) > $dayIndex && $workingdays[$dayIndex] === '0') {
            Response::success(['booking_mode' => $modeStr, 'date' => $date, 'slots' => [], 'shifts' => [], 'timescale' => $timescale]);
            return;
        }"""

unavail_check = """        if (strlen($workingdays) > $dayIndex && $workingdays[$dayIndex] === '0') {
            Response::success(['booking_mode' => $modeStr, 'date' => $date, 'slots' => [], 'shifts' => [], 'timescale' => $timescale]);
            return;
        }

        // Check for Doctor Unavailabilities / Leaves on this date
        $unavailStmt = $pdo->prepare("
            SELECT * FROM doctor_unavailabilities
            WHERE doctor_id = ?
              AND (clinic_id = ? OR clinic_id IS NULL)
              AND (
                  (leave_type = 'full_day' AND DATE(?) >= DATE(start_datetime) AND DATE(?) <= DATE(end_datetime))
                  OR (leave_type = 'shift' AND DATE(?) = DATE(start_datetime))
                  OR (leave_type = 'partial_hours' AND DATE(?) = DATE(start_datetime))
              )
        ");
        $unavailStmt->execute([$doctor_id, $clinicid, $date, $date, $date]);
        $unavailabilities = $unavailStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($unavailabilities as $u) {
            if ($u['leave_type'] === 'full_day') {
                $reasonMsg = (!empty($u['show_reason_to_patient']) && !empty($u['reason']))
                    ? $u['reason']
                    : 'الطبيب في عطلة / غير متاح في هذا اليوم';
                Response::success([
                    'booking_mode'     => $modeStr,
                    'date'             => $date,
                    'slots'            => [],
                    'shifts'           => [],
                    'timescale'        => $timescale,
                    'day_unavailable'  => true,
                    'reason'           => $reasonMsg
                ]);
                return;
            }
        }"""

if "Check for Doctor Unavailabilities" not in code and target_workingdays in code:
    code = code.replace(target_workingdays, unavail_check, 1)

# 3. Add filterUnavailabilities to slots mode
target_filter = "$slots = self::filterOffHours($slots, $date, $dayIndex, $offHours);"
replacement_filter = """$slots = self::filterOffHours($slots, $date, $dayIndex, $offHours);
        $slots = self::filterUnavailabilities($slots, $date, $unavailabilities, $timescale);"""

if "filterUnavailabilities($slots" not in code and target_filter in code:
    code = code.replace(target_filter, replacement_filter, 1)

# 4. Add Guard check in create() (patient booking)
target_create_slot = "            $appointmentDatetime = $data['date'] . ' ' . $time . ':00';"
replacement_create_slot = """            $appointmentDatetime = $data['date'] . ' ' . $time . ':00';

            $unavailConflict = self::checkUnavailabilityConflict($cd['doctor_id'], $cd['clinic_id'], $appointmentDatetime, $shiftType);
            if ($unavailConflict) {
                $msg = (!empty($unavailConflict['show_reason_to_patient']) && !empty($unavailConflict['reason']))
                    ? "الطبيب غير متاح في هذا التوقيت ({$unavailConflict['reason']})."
                    : "عذراً، الطبيب غير متاح في هذا التوقيت نظراً لوجود عطلة أو طلعة عن العمل.";
                Response::error($msg, 409);
            }"""

if target_create_slot in code and "checkUnavailabilityConflict($cd['doctor_id']" not in code:
    code = code.replace(target_create_slot, replacement_create_slot, 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(code)

print("SUCCESS: AppointmentController patched with unavailability guards")
