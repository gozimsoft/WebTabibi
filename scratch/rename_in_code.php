<?php
$dir = 'c:\xampp\htdocs\WebTabibi';
$replacements = [
    'Clinics' => 'clinics',
    'Doctors' => 'doctors',
    'Patients' => 'patients',
    'Apointements' => 'apointements',
    'ClinicRegistrations' => 'clinicregistrations',
    'DoctorRegistrations' => 'doctorregistrations',
    'Users' => 'users',
    'ClinicsDoctors' => 'clinicsdoctors',
    'DoctorsSettingApointements' => 'doctorssettingapointements',
    'DoctorsOffHours' => 'doctorsoffhours',
    'PatientsProches' => 'patientsproches',
    'DoctorsReasons' => 'doctorsreasons',
    'Specialties' => 'specialties',
    'Messages' => 'messages',
    'MessageThreads' => 'messagethreads',
    'DoctorsRatings' => 'doctorsratings',
    'Baladiyas' => 'baladiyas',
    'Reasons' => 'reasons',
    'Wilayas' => 'wilayas',
    'Tickets' => 'tickets',
    'TicketMessages' => 'ticketmessages',
    'Status' => 'status',
    'ClinicName' => 'clinicname',
    'Password' => 'password',
    'Phone' => 'phone',
    'Email' => 'email',
    'Address' => 'address',
    'FullName' => 'fullname',
    'ID' => 'id',
    'NameFr' => 'namefr',
    'NameAr' => 'namear',
    'ClinicsDoctor_id' => 'clinicsdoctor_id',
    'Doctor_ID' => 'doctor_id',
    'Clinic_ID' => 'clinic_id',
    'DoctorsReason_id' => 'doctorsreason_id',
    'TimeScale' => 'timescale',
    'DaytimeStart' => 'daytimestart',
    'DaytimeEnd' => 'daytimeend',
    'WorkingDays' => 'workingdays',
    'WeekBeginDay' => 'weekbeginday',
    'CountDays' => 'countdays',
    'AppointementDate' => 'appointementdate',
    'Consultation' => 'consultation',
    'Clinique' => 'clinique',
    'Patient_ID' => 'patient_id',
    'User_ID' => 'user_id',
    'UserType' => 'usertype',
    'PhotoProfile' => 'photoprofile',
    'Logo' => 'logo',
    'Username' => 'username',
    'Specialtie_id' => 'specialtie_id',
    'IsClose' => 'isclose',
    'Experience' => 'experience',
    'Pricing' => 'pricing',
    'Baladiya_id' => 'baladiya_id',
    'Name' => 'name',
    'Reason_id' => 'reason_id',
    'Rating' => 'rating',
    'Comment' => 'comment',
    'HidePatient' => 'hidepatient',
    'Notes' => 'notes',
    'RelationStatus' => 'relationstatus',
    'RequestedBy' => 'requestedby',
    'CreatedAt' => 'createdat',
    'SyncedAt' => 'syncedat',
    'IsDelete' => 'isdelete',
    'Source' => 'source',
    'ApointementColor' => 'apointementcolor',
    'Weight' => 'weight',
    'Height' => 'height',
    'IMC' => 'imc',
    'PAS' => 'pas',
    'PAC' => 'pac',
    'Oxygen' => 'oxygen',
    'Heartbeats' => 'heartbeats',
    'Updated_At' => 'updated_at',
    'EmailValidation' => 'emailvalidation',
    'PhoneValidation' => 'phonevalidation',
    'Global_id' => 'global_id',
    'RejectedReason' => 'rejectedreason',
    'ApprovedAt' => 'approvedat',
    'Speciality' => 'speciality',
    'Proche_id' => 'proche_id',
    'BirthDate' => 'birthdate',
    'BirthPlace' => 'birthplace',
    'BirthCountry' => 'birthcountry',
    'BloodType' => 'bloodtype',
    'EmergancyPhone' => 'emergancyphone',
    'EmergancyEmail' => 'emergancyemail',
    'EmergancyNote' => 'emergancynote',
    'Gender' => 'gender',
    'Note' => 'note',
    'DoctorId' => 'doctor_id',
    'DoctorName' => 'doctorname',
    'SpecialtyFr' => 'specialtyfr',
    'SpecialtyAr' => 'specialtyar',
    'SpecialtyId' => 'specialtyid'
];

// Sort replacements by length descending to avoid partial matches
uksort($replacements, function($a, $b) {
    return strlen($b) - strlen($a);
});

function process_dir($path) {
    global $replacements;
    $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($path));
    foreach ($files as $file) {
        if ($file->isDir()) continue;
        if (strpos($file->getPathname(), '.git') !== false) continue;
        if (strpos($file->getPathname(), 'node_modules') !== false) continue;
        if (strpos($file->getPathname(), 'scratch') !== false) continue;
        
        $ext = pathinfo($file->getPathname(), PATHINFO_EXTENSION);
        if (!in_array($ext, ['php', 'js', 'jsx', 'ts', 'tsx', 'html', 'sql', 'json'])) continue;
        
        $content = file_get_contents($file->getPathname());
        $original = $content;
        
        foreach ($replacements as $old => $new) {
            // Using word boundaries to be safe
            $content = preg_replace('/\b' . $old . '\b/', $new, $content);
        }
        
        if ($content !== $original) {
            file_put_contents($file->getPathname(), $content);
            echo "Updated: " . $file->getPathname() . "\n";
        }
    }
}

echo "Starting replacement...\n";
process_dir($dir . '/backend');
process_dir($dir . '/frontend');
echo "Done.\n";
