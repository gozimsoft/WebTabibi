<?php
$dir = 'c:\xampp\htdocs\WebTabibi';
$words = [
    'clinics', 'doctors', 'patients', 'apointements', 'clinicregistrations', 'doctorregistrations', 'users', 
    'clinicsdoctors', 'doctorssettingapointements', 'doctorsoffhours', 'patientsproches', 'doctorsreasons', 
    'specialties', 'messages', 'messagethreads', 'doctorsratings', 'baladiyas', 'reasons', 'wilayas', 
    'tickets', 'ticketmessages', 'status', 'clinicname', 'password', 'phone', 'email', 'address', 
    'fullname', 'id', 'namefr', 'namear', 'clinicsdoctor_id', 'doctor_id', 'clinic_id', 'doctorsreason_id', 
    'timescale', 'daytimestart', 'daytimeend', 'workingdays', 'weekbeginday', 'countdays', 'appointementdate', 
    'consultation', 'clinique', 'patient_id', 'user_id', 'usertype', 'photoprofile', 'logo', 'username', 
    'specialtie_id', 'isclose', 'experience', 'pricing', 'baladiya_id', 'name', 'reason_id', 'rating', 
    'comment', 'hidepatient', 'notes', 'relationstatus', 'requestedby', 'createdat', 'syncedat', 'isdelete', 
    'source', 'apointementcolor', 'weight', 'height', 'imc', 'pas', 'pac', 'oxygen', 'heartbeats', 
    'updated_at', 'emailvalidation', 'phonevalidation', 'global_id', 'rejectedreason', 'approvedat', 
    'speciality', 'proche_id', 'birthdate', 'birthplace', 'birthcountry', 'bloodtype', 'emergancyphone', 
    'emergancyemail', 'emergancynote', 'gender', 'note', 'doctorname', 'specialtyfr', 'specialtyar', 'specialtyid',
    'fix', 'casnos', 'speakinglanguage', 'rpps', 'numregister', 'degrees', 'academytitles', 'postcode', 
    'timebegin', 'timeend', 'clinicid', 'targetid', 'targetname', 'patientname', 'ticket_id', 'sender_type', 
    'sender_id', 'created_at', 'is_read', 'doctoremail', 'bloodgroup', 'country', 'specialty'
];

$mappings = [
    'DoctorId' => 'doctor_id',
    'SpecialtyId' => 'specialtyid',
    'Clinic_ID' => 'clinic_id',
    'User_ID' => 'user_id',
    'Patient_ID' => 'patient_id',
    'Doctor_ID' => 'doctor_id',
    'Specialtie_id' => 'specialtie_id',
    'Ticket_ID' => 'ticket_id',
    'Sender_Type' => 'sender_type',
    'Sender_ID' => 'sender_id',
    'Created_At' => 'created_at',
    'Is_Read' => 'is_read',
    'DoctorEmail' => 'doctoremail',
    'PatientName' => 'patientname',
    'BloodGroup' => 'bloodgroup',
    'TargetID' => 'targetid',
    'TargetName' => 'targetname',
    'ClinicID' => 'clinicid',
    'TimeBegin' => 'timebegin',
    'TimeEnd' => 'timeend'
];

function process_dir($path) {
    global $words, $mappings;
    $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($path));
    foreach ($files as $file) {
        if ($file->isDir()) continue;
        if (strpos($file->getPathname(), '.git') !== false) continue;
        if (strpos($file->getPathname(), 'node_modules') !== false) continue;
        if (strpos($file->getPathname(), 'scratch') !== false) continue;
        if (strpos($file->getPathname(), 'vendor') !== false) continue;
        
        $ext = pathinfo($file->getPathname(), PATHINFO_EXTENSION);
        if (!in_array($ext, ['php', 'js', 'jsx', 'ts', 'tsx', 'html', 'sql', 'json'])) continue;
        
        $content = file_get_contents($file->getPathname());
        $original = $content;
        
        foreach ($mappings as $old => $new) {
            $content = preg_replace('/\b' . $old . '\b/i', $new, $content);
        }
        
        foreach ($words as $word) {
            $content = preg_replace_callback('/\b' . $word . '\b/i', function($m) use ($word) {
                if ($m[0] === $word) return $m[0];
                return $word; 
            }, $content);
        }
        
        if ($content !== $original) {
            file_put_contents($file->getPathname(), $content);
            echo "Updated: " . $file->getPathname() . "\n";
        }
    }
}

echo "Starting final replacement round...\n";
process_dir($dir . '/backend');
process_dir($dir . '/frontend');
echo "Done.\n";
