import sys

path = 'frontend/src/App.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

target1 = """    getUnavailabilities: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return req("GET", `/doctor/unavailabilities${qs ? '?' + qs : ''}`);
    },"""

repl1 = """    getUnavailabilities: (params = {}) => {
      const p = { ...params, _t: Date.now() };
      const qs = new URLSearchParams(p).toString();
      return req("GET", `/doctor/unavailabilities${qs ? '?' + qs : ''}`);
    },"""

if target1 not in content:
    print("target1 not found in App.jsx")
    sys.exit(1)

content = content.replace(target1, repl1)
with open(path, 'w', encoding='utf-8', newline='') as f:
    f.write(content)

print("App.jsx patched with cache buster successfully!")
