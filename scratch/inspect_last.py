import json
import sys

sys.stdout.reconfigure(encoding='utf-8')
with open(r'C:\Users\Amar\.gemini\antigravity-ide\brain\1fcf51ae-a580-4db0-9f1b-3f105f0401fb\.system_generated\logs\transcript.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        obj = json.loads(line)
        idx = obj.get('step_index', 0)
        if 745 <= idx <= 788:
            t = obj.get('type')
            if t == 'PLANNER_RESPONSE':
                for tc in obj.get('tool_calls', []):
                    print(f"[{idx}] CALL {tc.get('name')}: {json.dumps(tc.get('args', {}), ensure_ascii=False)[:200]}")
            elif t in ('RUN_COMMAND', 'VIEW_FILE', 'LIST_DIR'):
                content = obj.get('content', '')
                print(f"[{idx}] RESULT {t}: {content[:300]}")
