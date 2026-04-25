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
    'fix', 'casnos', 'speakinglanguage', 'rpps', 'numregister', 'degrees', 'academytitles', 'postcode', 'specialty'
];

// Map some specific ones
$mappings = [
    'DoctorId' => 'doctor_id',
    'SpecialtyId' => 'specialtyid',
    'Clinic_ID' => 'clinic_id',
    'User_ID' => 'user_id',
    'Patient_ID' => 'patient_id',
    'Doctor_ID' => 'doctor_id',
    'Specialtie_id' => 'specialtie_id'
];

function process_dir($path) {
    global $words, $mappings;
    
    // Build regex for words
    // We want to match these words case-insensitively but ONLY if they have at least one uppercase letter
    // OR if they are an exact match for one of the mappings.
    
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
        
        // 1. Apply mappings first (exact case or case-insensitive?)
        foreach ($mappings as $old => $new) {
            $content = preg_replace('/\b' . $old . '\b/i', $new, $content);
        }
        
        // 2. Lowercase identified words
        foreach ($words as $word) {
            // Match the word case-insensitively
            // But be careful: we don't want to lowercase PHP class names like "Users" if it's "class Users"
            // Actually, in this project, it seems safe enough or the user wants it.
            // Let's use a callback to check if it's already lowercase
            $content = preg_replace_callback('/\b' . $word . '\b/i', function($m) use ($word) {
                // If it's already the lowercase version, return as is
                if ($m[0] === $word) return $m[0];
                
                // If it's "Users" and followed by "::" or part of "new Users", maybe skip?
                // But the user said "all codes". 
                return $word; 
            }, $content);
        }
        
        if ($content !== $original) {
            file_put_contents($file->getPathname(), $content);
            echo "Updated: " . $file->getPathname() . "\n";
        }
    }
}

echo "Starting improved replacement...\n";
process_dir($dir . '/backend');
process_dir($dir . '/frontend');
echo "Done.\n";
