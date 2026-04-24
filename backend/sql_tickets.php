<?php
require_once __DIR__ . '/core/Database.php';

$pdo = Database::getInstance();

$sql = "
CREATE TABLE IF NOT EXISTS Tickets (
    ID CHAR(36) PRIMARY KEY,
    Patient_ID CHAR(36) NOT NULL,
    Doctor_ID CHAR(36) NULL,
    Clinic_ID CHAR(36) NULL,
    Subject VARCHAR(255) NOT NULL,
    Status ENUM('OPEN', 'PENDING', 'CLOSED') DEFAULT 'OPEN',
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (Patient_ID) REFERENCES Patients(ID) ON DELETE CASCADE,
    FOREIGN KEY (Doctor_ID) REFERENCES Doctors(ID) ON DELETE CASCADE,
    FOREIGN KEY (Clinic_ID) REFERENCES Clinics(ID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS TicketMessages (
    ID CHAR(36) PRIMARY KEY,
    Ticket_ID CHAR(36) NOT NULL,
    Sender_Type ENUM('patient', 'doctor', 'clinic') NOT NULL,
    Sender_ID CHAR(36) NOT NULL,
    Message TEXT NOT NULL,
    Is_Read TINYINT(1) DEFAULT 0,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Ticket_ID) REFERENCES Tickets(ID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_tickets_patient ON Tickets(Patient_ID);
CREATE INDEX idx_tickets_doctor ON Tickets(Doctor_ID);
CREATE INDEX idx_tickets_clinic ON Tickets(Clinic_ID);
CREATE INDEX idx_ticket_messages_ticket ON TicketMessages(Ticket_ID);
";

try {
    $pdo->exec($sql);
    echo "Tables Tickets and TicketMessages created successfully.\n";
} catch (PDOException $e) {
    echo "Error creating tables: " . $e->getMessage() . "\n";
}
