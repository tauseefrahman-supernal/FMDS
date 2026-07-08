/**
 * views/login.js — full-screen branded "operations console" sign-in.
 *
 * renderLogin(mount, onEnter)
 *   - Choose Department (9 from departments.json, passed via mount dataset) + Role (L2 / L1)
 *   - Reflects the persona once both are chosen
 *   - L1 disabled for departments where hasL1 !== true (company-data depts are L2-only)
 *   - "Enter FMDS OS →" calls onEnter({ deptId, role, persona })
 *
 * Persona rules:
 *   Service + L1 → "Diane"
 *   Service + L2 → "JC" (Team JC lead)
 *   otherwise L2 → department `lead` from departments.json
 *   otherwise L1 → generic "Team Rep"
 */

// Resolve the persona name/role-label for a given dept + role.
export function resolvePersona(dept, role) {
  if (!dept || !role) return null;
  if (dept.id === 'service' && role === 'L1') {
    return { name: 'Diane', label: 'Service Rep · L1' };
  }
  if (dept.id === 'service' && role === 'L2') {
    return { name: 'JC', label: 'Team JC Lead · L2' };
  }
  if (role === 'L2') {
    const lead = (dept.lead || '').split('/')[0].trim() || dept.name + ' Lead';
    return { name: lead, label: `${dept.name} Lead · L2` };
  }
  // L1 fallback
  return { name: 'Team Rep', label: `${dept.name} · L1` };
}

function initials(name) {
  return name.split(/[\s/]+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

export function renderLogin(mount, onEnter, departments) {
  const depts = departments || [];
  let deptId = null;
  let role = null;   // 'L2' | 'L1'

  mount.innerHTML = `
    <div class="login">
      <div class="login__brandside">
        <div class="login__brand">
          <div class="rail__mark">FM</div>
          <div class="login__brand-word" style="font-family:var(--font-serif)">FMDS OS<small style="font-family:var(--font-sans)">World Emblem</small></div>
        </div>
        <div class="login__lead">
          <div class="login__headline" style="font-family:var(--font-serif)">The operating layer<br>for department leaders.</div>
          <p class="login__sub">
            Live KPI boards, problem-solving, and standard work — every metric
            traced to target, every board rolling up to Leadership OS.
          </p>
          <div class="login__stats">
            <div>
              <div class="login__stat-val">9</div>
              <div class="login__stat-lbl">Departments</div>
            </div>
            <div>
              <div class="login__stat-val">L1–L2</div>
              <div class="login__stat-lbl">Roles</div>
            </div>
            <div>
              <div class="login__stat-val">FMDS</div>
              <div class="login__stat-lbl">Toyota-Lean</div>
            </div>
          </div>
        </div>
      </div>

      <div class="login__formside">
        <div class="login__form">
          <h1>Sign in</h1>
          <p class="login__form-sub">Choose your department and role to open your console.</p>

          <div class="login__field">
            <label class="login__field-label">Department</label>
            <div class="login__select-grid" id="dept-grid">
              ${depts.map(d => `
                <button class="opt-chip" data-dept="${d.id}"
                        ${d.frozen ? 'title="Frozen — Phase 2"' : ''}>
                  ${d.name}
                </button>`).join('')}
            </div>
          </div>

          <div class="login__field">
            <label class="login__field-label">Role</label>
            <div class="login__select-grid role-grid" id="role-grid">
              <button class="opt-chip opt-chip--role" data-role="L2">
                <span class="role-k">L2</span>
                <span class="role-d">Department lead — team board</span>
              </button>
              <button class="opt-chip opt-chip--role" data-role="L1" id="role-l1">
                <span class="role-k">L1</span>
                <span class="role-d">Rep / operator — My Day</span>
              </button>
            </div>
          </div>

          <div class="login__persona-preview" id="persona-preview">
            <span class="login__persona-empty">Choose a department and role to continue.</span>
          </div>

          <button class="btn btn--primary login__enter" id="enter-btn" disabled>
            Enter FMDS OS →
          </button>
          <p class="login__demo-note">Demo — choose any role to explore.</p>
        </div>
      </div>
    </div>`;

  const deptGrid   = mount.querySelector('#dept-grid');
  const roleGrid   = mount.querySelector('#role-grid');
  const l1Btn      = mount.querySelector('#role-l1');
  const preview    = mount.querySelector('#persona-preview');
  const enterBtn   = mount.querySelector('#enter-btn');

  function currentDept() { return depts.find(d => d.id === deptId) || null; }

  function refreshL1Availability() {
    const dept = currentDept();
    const allowsL1 = dept ? dept.hasL1 === true : true;
    l1Btn.disabled = dept ? !allowsL1 : false;
    // If L1 was selected but new dept forbids it, drop the role.
    if (!allowsL1 && role === 'L1') {
      role = null;
      roleGrid.querySelectorAll('.opt-chip').forEach(b => b.classList.remove('opt-chip--active'));
    }
  }

  function updatePreview() {
    const dept = currentDept();
    const persona = resolvePersona(dept, role);
    if (persona) {
      preview.classList.add('login__persona-preview--set');
      preview.innerHTML = `
        <div class="login__persona-avatar">${initials(persona.name)}</div>
        <div>
          <div class="login__persona-name">${persona.name}</div>
          <div class="login__persona-role">${persona.label}</div>
        </div>`;
    } else {
      preview.classList.remove('login__persona-preview--set');
      preview.innerHTML = `<span class="login__persona-empty">Choose a department and role to continue.</span>`;
    }
    enterBtn.disabled = !(dept && role && persona);
  }

  deptGrid.querySelectorAll('.opt-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      deptId = btn.dataset.dept;
      deptGrid.querySelectorAll('.opt-chip').forEach(b => b.classList.remove('opt-chip--active'));
      btn.classList.add('opt-chip--active');
      refreshL1Availability();
      updatePreview();
    });
  });

  roleGrid.querySelectorAll('.opt-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      role = btn.dataset.role;
      roleGrid.querySelectorAll('.opt-chip').forEach(b => b.classList.remove('opt-chip--active'));
      btn.classList.add('opt-chip--active');
      updatePreview();
    });
  });

  enterBtn.addEventListener('click', () => {
    const dept = currentDept();
    const persona = resolvePersona(dept, role);
    if (!dept || !role || !persona) return;
    onEnter({ deptId, role, persona });
  });
}
