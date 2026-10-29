import re

with open('frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Extract lucide imports
match = re.search(r'import\s*\{([^}]+)\}\s*from\s*["\']lucide-react["\']', code)
imported_icons = set()
if match:
    for item in match.group(1).split(','):
        clean = item.strip()
        if clean:
            imported_icons.add(clean)

print("Imported icons count:", len(imported_icons))

# Find all uppercase JSX tags in App.jsx
jsx_tags = set(re.findall(r'<([A-Z][a-zA-Z0-9]+)', code))
print("Total JSX tags:", len(jsx_tags))

# Check for lucide-like icons used but not imported (and not other components)
common_components = {
  'CapacitorApp', 'ContactPage', 'GoogleCalendarButton', 'AppointmentManager', 'UserGuide',
  'AppDownloadPage', 'InstallPage', 'DoctorAppointmentSettings', 'DoctorOffHoursSettings',
  'PatientAttendingDoctorCard', 'AdminSupportUserTicketsPage', 'AdminSupportBackoffice',
  'SuperAdminAccountManagement', 'ClinicAppointmentManager', 'RequestsPage', 'DoctorClinicsPage',
  'AvatarCropModal', 'AccountSecurityPill', 'AccountSecurityCard', 'KnowledgeBasePage',
  'PairDevicePage', 'Spinner', 'Skeleton', 'CardSkeleton', 'ListSkeleton', 'DoctorDetailSkeleton',
  'AppointmentSkeleton', 'Stars', 'VerifiedBadge', 'AvailabilityPulse', 'DoctorImage', 'Badge',
  'Card', 'Input', 'PasswordInput', 'Btn', 'AnimatePresence', 'App', 'AdminLayout', 'AdminOverview',
  'AdminSupportPage', 'AdminTicketsTab', 'AdminUsersTab', 'AdminClinicsTab', 'AdminDoctorsTab',
  'AdminPartnersTab', 'AdminLogsTab', 'AdminSystemTab', 'AdminStatsTab', 'AdminSettingsTab',
  'SuperAdminAccountsTab', 'ErrorBoundary', 'Fragment', 'React', 'Select', 'Textarea',
  'DoctorScheduleModal', 'DoctorReviewModal', 'ReportIssueModal', 'BookingModal', 'CancelConfirmModal'
}

missing = []
for tag in jsx_tags:
    if tag not in imported_icons and tag not in common_components:
        # Check if imported anywhere in file
        if not re.search(r'\b(import|const|let|var|function|class)\s+.*\b' + tag + r'\b', code):
            missing.append(tag)

print("Potential missing identifiers:", missing)
