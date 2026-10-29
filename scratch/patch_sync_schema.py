import os

target = 'D:/Application Web/Tabibi_Rect/server/src/db/syncSchema.ts'

with open(target, 'r', encoding='utf-8') as f:
    content = f.read()

# Add import of ensureAppointmentSchema at top if not present
if 'import { ensureAppointmentSchema }' not in content:
    content = "import { ensureAppointmentSchema } from './ensureAppointmentSchema';\n" + content

# Add call at end of ensureArchitectureV3Tables
old_end = """       ON DUPLICATE KEY UPDATE `Doctor_id` = VALUES(`Doctor_id`);`
    );
  } catch (err: any) {
    console.error('[Tabibi Architecture Sync Error]:', err.message);
  }
}"""

new_end = """       ON DUPLICATE KEY UPDATE `Doctor_id` = VALUES(`Doctor_id`);`
    );

    // Auto-ensure appointment & dual-booking queue schema
    try {
      await ensureAppointmentSchema({ skipBackupForTest: true });
    } catch (appErr: any) {
      console.warn('[Tabibi Architecture Sync] Non-blocking appointment schema notice:', appErr.message);
    }
  } catch (err: any) {
    console.error('[Tabibi Architecture Sync Error]:', err.message);
  }
}"""

content = content.replace(old_end, new_end)

with open(target, 'w', encoding='utf-8') as f:
    f.write(content)

print("syncSchema.ts patched successfully!")
