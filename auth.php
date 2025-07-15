<?php
// ملف: auth.php
session_start();

if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}

function isPatient() {
    return isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'patient';
}

function isDoctor() {
    return isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'doctor';
}
