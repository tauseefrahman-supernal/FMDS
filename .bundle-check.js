
window.__M = {};
// localStorage guard (sandboxed iframe may block it)
var __ls = (function(){ try{ var t="__t"; window.localStorage.setItem(t,"1"); window.localStorage.removeItem(t); return window.localStorage; }
  catch(e){ var m={}; return {getItem:function(k){return (k in m)?m[k]:null;}, setItem:function(k,v){m[k]=String(v);}, removeItem:function(k){delete m[k];}, clear:function(){for(var k in m)delete m[k];}}; } })();
// fetch shim -> embedded data
(function(){ var real = window.fetch ? window.fetch.bind(window) : null;
  window.fetch = function(url){ var key = String(url).split("?")[0].replace(/^\.?\//,"");
    var D = window.__FMDS_DATA__ || {};
    if (key in D) return Promise.resolve({ ok:true, status:200, json:function(){return Promise.resolve(D[key]);}, text:function(){return Promise.resolve(JSON.stringify(D[key]));} });
    var hit = Object.keys(D).find(function(k){ return k.split("/").pop() === key.split("/").pop(); });
    if (hit) return Promise.resolve({ ok:true, status:200, json:function(){return Promise.resolve(D[hit]);} });
    return Promise.reject(new Error("no bundled resource: "+url));
  };
})();
window.__FMDS_DATA__ = {"data/departments.json": [{"id": "service","name": "Service","lead": "JC / Noel","tier": 1,"layerModel": "team","mechanism": "sum","hasL1": true,"headlineKpi": "Incoming Rev WE","headlineTarget": 252661,"headlineActual": 252661,"headlineUnit": "$/wk"},{"id": "operations","name": "Operations","lead": "Jim Kozel","tier": 1,"layerModel": "location","mechanism": "independent","hasL1": true,"headlineKpi": "OTP","headlineTarget": 0.985,"headlineActual": 0.863,"headlineUnit": "ratio"},{"id": "sales","name": "Sales","lead": "Tony Morando","tier": 1,"layerModel": "team","mechanism": "sum","hasL1": true,"headlineKpi": "Incoming Rev WE Outside","headlineTarget": 45869,"headlineActual": 45869,"headlineUnit": "$/wk"},{"id": "hr","name": "HR","lead": "Clarissa","tier": 1,"layerModel": "metric","mechanism": "avg","hasL1": false,"headlineKpi": "TRIR","headlineTarget": 0,"headlineActual": 30.8,"headlineUnit": "rate"},{"id": "odg","name": "ODG","lead": "Eric","tier": 1,"layerModel": "metric","mechanism": "avg","hasL1": false,"headlineKpi": "FMDS Adoption","headlineTarget": 1.0,"headlineActual": 0.932,"headlineUnit": "ratio"},{"id": "marketing","name": "Marketing","lead": "Carlos","tier": 2,"layerModel": "metric","mechanism": "sum","hasL1": false,"headlineKpi": "WEI Total Leads Revenue","headlineTarget": null,"headlineActual": null,"headlineUnit": "$/mo","illustrative": true},{"id": "logistics","name": "Logistics","lead": null,"tier": 2,"layerModel": "location","mechanism": "sum","hasL1": false,"headlineKpi": "WE Shipping Margin","headlineTarget": 0.52,"headlineActual": null,"headlineUnit": "ratio"},{"id": "it","name": "IT","lead": null,"tier": 2,"layerModel": "metric","mechanism": "manual","hasL1": false,"headlineKpi": "Uptime","headlineTarget": 0.998,"headlineActual": null,"headlineUnit": "ratio","illustrative": true},{"id": "finance","name": "Finance","lead": null,"tier": 3,"layerModel": "metric","mechanism": "manual","hasL1": false,"frozen": true,"frozenNote": "Frozen — restructure + NetSuite sunset; Phase 2","headlineKpi": "Cash Conversion","headlineTarget": 1,"headlineActual": null,"headlineUnit": "ratio","illustrative": true}],"data/eightstep-template.json": {"title": "8-Step Problem Solving A3","source": "8 Step Problem Solving.docx (AC — WMS), Rev 02 (01/Abr/24)","purpose": "Identify a problem and take logical steps to a desired solution. Prevent problems before they occur, resolve recurring errors, reduce the impact of each incident.","pdcaMap": {"PLAN": [1,2,3,4,5],"DO": [6],"CHECK": [7],"ACT": [8]},"header": {"fields": ["Title of Problem Solving","Sponsor","Leader","Team","Rev Date"]},"fishboneCategories": ["Man","Method","Machine","Material","Environment","Measurement"],"scoringMatrix": {"columns": [{"key": "S","label": "Safety"},{"key": "Q","label": "Quality"},{"key": "C","label": "Cost"},{"key": "T","label": "Time"},{"key": "Cu","label": "Customer"},{"key": "Ef","label": "Effective"},{"key": "OA","label": "Overall"}],"scale": {"0": "worst","1": "moderate","2": "best"},"note": "Score each countermeasure 0/1/2 per dimension. Overall (OA) is the ranked priority, not a simple sum."},"statusEnum": {"R": "Behind","Y": "At Risk","G": "On Track","C": "Completed"},"methods": {"genchiGenbutsu": "Go and see for yourself — practical experience over theoretical knowledge. Used in Steps 2 & 4.","nemawashi": "Preliminary work to involve other sections/departments — build consensus before committing to a countermeasure. Used in Step 5.","yokoten": "Share the countermeasure with other processes and locations that could apply it. Used in Step 8."},"odgGate": {"atStep": 6,"reviewers": "Eric / Allison (ODG)","rule": "Step 6 is an ODG gate — the countermeasure plan is submitted to ODG for review before implementation proceeds. Statuses: pending → submitted → approved / changes-requested."},"sopWriteBack": {"atStep": 8,"rule": "Step 8 writes the improvement back to the SOP library (Standard Work). SOPs are the INPUT to Steps 1–5 and the OUTPUT of Step 8 (Yokoten)."},"steps": [{"n": 1,"pdca": "PLAN","name": "Clarify the Problem","description": "Visualize current vs standard — the gap is the problem. Key words: REDUCE, IMPROVE, ENSURE.","role": "main","aiPrefill": true,"fields": [{"key": "ultimateGoal","label": "Ultimate Goal","hint": "High-level KPI assurance statement to improve/reduce/ensure."},{"key": "standard","label": "Standard","hint": "The current standard. If none exists, you must create one."},{"key": "current","label": "Current Situation","hint": "What is actually happening right now."},{"key": "gap","label": "Gap = Problem","hint": "The difference between current situation and standard — show it in a callout."},{"key": "chart","label": "Chart","hint": "Visual of the gap over time (actual vs target)."}]},{"n": 2,"pdca": "PLAN","name": "Break Down the Problem","description": "Systematic breakdown large→small. Answer what/where/when/who (NOT why). Genchi Genbutsu to the point of occurrence.","role": "sub","aiPrefill": true,"method": "genchiGenbutsu","fields": [{"key": "stratification","label": "Stratification (what / where / when / who)","hint": "Break the gap into smaller problems by location, period, job type, product line, team."},{"key": "prioritizedProblem","label": "Prioritized Problem at point of occurrence","hint": "Narrow to a single prioritized problem at the point where the gap originates."}]},{"n": 3,"pdca": "PLAN","name": "Target Setting (Objective)","description": "Set measurable, concrete, challenging targets. Key word: ELIMINATE the prioritized problem at point of occurrence.","role": "sub","aiPrefill": true,"fields": [{"key": "doWhat","label": "Do What?","hint": "The action verb and subject — ELIMINATE the prioritized problem."},{"key": "toWhat","label": "To What?","hint": "The target value / condition."},{"key": "byWhen","label": "By When?","hint": "Target date."},{"key": "chart","label": "Chart","hint": "Elimination of prioritized problem relative to the big-problem gap."}]},{"n": 4,"pdca": "PLAN","name": "Root Cause Analysis","description": "At the point of occurrence, fact-based (no assumptions, no blaming). Keep asking Why until a single root cause. 6M fishbone.","role": "sub","aiPrefill": true,"highLeverage": true,"method": "genchiGenbutsu","whyLadder": ["why1","why2","why3","why4","why5"],"fields": [{"key": "why1","label": "Why 1","hint": "Directly observable symptom — what you can see happening.","fishbone": "Man"},{"key": "why2","label": "Why 2","hint": "Why did Why 1 occur?","fishbone": "Method"},{"key": "why3","label": "Why 3","hint": "Why did Why 2 occur?","fishbone": "Machine"},{"key": "why4","label": "Why 4","hint": "Why did Why 3 occur?","fishbone": "Material"},{"key": "why5","label": "Why 5","hint": "Why did Why 4 occur? (root-cause level)","fishbone": "Environment"},{"key": "rootCause","label": "Root Cause (confirmed)","hint": "The single systemic root cause supported by the 5-Whys and 6M."}]},{"n": 5,"pdca": "PLAN","name": "Develop Countermeasures","description": "Brainstorm many; narrow to the most practical/effective (risk & difficulty). Build consensus (Nemawashi). Score each on the matrix.","role": "sub","aiPrefill": true,"method": "nemawashi","scoring": "scoringMatrix","fields": [{"key": "countermeasures","label": "Countermeasure Scoring Matrix","hint": "One row per candidate; score Safety/Quality/Cost/Time/Customer/Effective 0–2, then set Overall priority.","columns": ["text","S","Q","C","T","Cu","Ef","OA"]}]},{"n": 6,"pdca": "DO","name": "See Countermeasures Through (Implement)","description": "Implement countermeasures one by one. Submit the plan to the ODG gate before implementing. Track with R-Y-G-C.","role": "activity","aiPrefill": true,"odgGate": true,"fields": [{"key": "actionRegister","label": "Action Register","hint": "No. | Implementation Plan | Start Date | Due Date | Responsible | Status (R=Behind / Y=At Risk / G=On Track / C=Completed). Up to 10 rows.","columns": ["no","plan","startDate","dueDate","responsible","status"],"statusEnum": ["R","Y","G","C"],"statusLegend": {"R": "Behind","Y": "At Risk","G": "On Track","C": "Completed"}}]},{"n": 7,"pdca": "CHECK","name": "Monitor Results & Processes","description": "Evaluate result + process from three viewpoints (Customer / World Emblem / your own). If failure → return to Step 5.","role": "results","aiPrefill": false,"fields": [{"key": "kpi","label": "KPI","hint": "The KPI being tracked."},{"key": "measurementStart","label": "Measurement — Start (baseline)","hint": "Baseline actual when problem was confirmed."},{"key": "measurementEnd","label": "Measurement — End (result)","hint": "Actual after implementing countermeasures."},{"key": "newTarget","label": "New Target","hint": "Revised target if the countermeasure redefined the baseline."},{"key": "narrative","label": "Result Narrative","hint": "What happened, and why success/failure."},{"key": "chart","label": "Chart — Actual vs Target","hint": "KPI trajectory before and after implementation."}]},{"n": 8,"pdca": "ACT","name": "Standardize Successful Process","description": "Standardize the new process and Yokoten it. SOPs are the OUTPUT of this step — write the improvement back to the SOP library.","role": "results","aiPrefill": false,"sopWriteBack": true,"method": "yokoten","fields": [{"key": "processDocuments","label": "Process Documents Created/Updated","hint": "Every BWI/SWI/SOP created or updated. Link to the WMS SW Update Request ticket."},{"key": "training","label": "Training on New Process(es) — Who & When","hint": "Who was trained and when (use the Training Log Sheet, RH-FR-6.2-001)."},{"key": "yokoten","label": "Yokoten Plan","hint": "Communicate in-plant and to other plants/processes that could apply the countermeasure."},{"key": "improvementImage","label": "Improvement Image or Chart","hint": "Before/after visual confirming the process change."}]}]},"data/finance.json": {"id": "finance","name": "Finance","lead": "Will Schwartz","tier": 3,"mechanism": "manual","rollupMethod": "manual","frozen": true,"frozenNote": "Frozen — restructure + NetSuite sunset; Phase 2","frozenDetail": "Finance board is KPI-display only. No interactive problem-solving or standard-work features until Phase 2 (post-NetSuite migration). Actuals are from the 2026 FMDS Finance Board KPIs workbook.","note": "Cash Conversion = CFO / Net Income (target 1). NWC = (AR + Inv − AP) / Sales. Inventory Turns = COGS / Avg Inv. AR/AP Aging = >30-day consolidated ratio.","kpis": [{"id": "cash_conversion","name": "Cash Conversion Ratio","level": 1,"isMain": true,"parentId": null,"target": 1,"actual": null,"nodata": true,"nodataNote": "Awaiting Phase 2 NetSuite data migration. Formula: CFO / Net Income.","unit": "ratio","direction": "higher_better","source": "Finance Board KPIs","rollupMethod": "manual","contributors": [],"flag": null,"series": [],"targetSource": "Business Central"},{"id": "budget_variance_ytd","name": "Budget Variance YTD","level": 1,"isMain": true,"parentId": null,"target": null,"actual": 8360000,"unit": "$","direction": "lower_better","source": "Finance Board KPIs","rollupMethod": "manual","contributors": [],"flag": "Budget Variance target not encoded in board — registry notes $8,364,000 YTD as the current figure. Lower variance = better.","note": "YTD $8.36M variance figure from registry. Target formally defined in Hoshin, not in board cell.","series": [8360000],"targetSource": "Business Central"},{"id": "budget_variance_mtd","name": "Budget Variance MTD","level": 1,"isMain": true,"parentId": null,"target": null,"actual": 890000,"unit": "$","direction": "lower_better","source": "Finance Board KPIs","rollupMethod": "manual","contributors": [],"flag": "Target not encoded in board cell — registry notes $890,000 MTD as the current figure.","series": [890000],"targetSource": "Business Central"},{"id": "nwc","name": "Net Working Capital","level": 1,"isMain": true,"parentId": null,"target": null,"actual": 0.18,"unit": "ratio","direction": "higher_better","source": "Finance Board KPIs","rollupMethod": "manual","contributors": [],"flag": "NWC target not formally set in board. Formula: (AR + Inv − AP) / Sales. Sales WE $74M / HPI $14.8M.","note": "NWC 0.18 is the current actual. Target direction: higher is better (more liquidity buffer).","series": [0.18],"targetSource": "Business Central"},{"id": "inventory_turns","name": "Inventory Turns","level": 1,"isMain": true,"parentId": null,"target": null,"actual": 8,"unit": "turns/yr","direction": "higher_better","source": "Finance Board KPIs","rollupMethod": "manual","contributors": [],"flag": "Target not formally set in board cell. Formula: COGS / Avg Inventory.","series": [8],"targetSource": "Business Central"},{"id": "ar_aging","name": ">30d AR Aging","level": 1,"isMain": true,"parentId": null,"target": 0.05,"actual": 0.05,"unit": "ratio","direction": "lower_better","source": "Finance Board KPIs","rollupMethod": "manual","contributors": ["ar_aging_we","ar_aging_hpi"],"flag": null,"note": "Consolidated 0.05; WE 0.02 / HPI 0.08.","series": [0.05],"targetSource": "Business Central"},{"id": "ar_aging_we","name": ">30d AR Aging — WE","level": 2,"isMain": false,"parentId": "ar_aging","target": 0.05,"actual": 0.02,"unit": "ratio","direction": "lower_better","source": "Finance Board KPIs","rollupMethod": null,"contributors": [],"flag": null,"series": [0.02],"targetSource": "Business Central"},{"id": "ar_aging_hpi","name": ">30d AR Aging — HPI","level": 2,"isMain": false,"parentId": "ar_aging","target": 0.05,"actual": 0.08,"unit": "ratio","direction": "lower_better","source": "Finance Board KPIs","rollupMethod": null,"contributors": [],"flag": null,"series": [0.08],"targetSource": "Business Central"},{"id": "ap_aging","name": ">30d AP Aging","level": 1,"isMain": true,"parentId": null,"target": 0.05,"actual": 0.05,"unit": "ratio","direction": "lower_better","source": "Finance Board KPIs","rollupMethod": "manual","contributors": [],"flag": null,"series": [0.05],"targetSource": "Business Central"}],"gaps": ["Cash Conversion Ratio: awaiting Phase 2 NetSuite migration — no live actual.","Budget Variance YTD/MTD: targets not encoded in board cell (live in Hoshin only).","NWC and Inventory Turns: targets not formally set in board — actuals from registry.","Granular AR/AP sub-KPIs (Medius routing, unposted payments, credit memos) exist in dedicated sheets but not on main board."]},"data/hoshin.json": {"_meta": {"source": "CEO DASHBOARD 26.xlsm > 'Executive Hoshin Activities' sheet","extractedBy": "scripts run for FMDS OS Phase B / Task B1 (2026-07-08)","zeroInventedData": "Every hoshinPriority/activityPlan/target/supportFunction/lead string is copied verbatim from a workbook cell (only outer whitespace/newlines trimmed). When an activity's Targets/Support Function/Lead were laid out as several distinct values across physical rows (rather than one merged cell), those verbatim per-row values were concatenated with \"\\n\" in row order -- no new text was authored.","timelineMethod": "The Implementation Time Line (cols G:U = Oct'25..Dec'26) is a Gantt-style cell-fill highlight, not a cell value -- but a naive 'solid fill = in range' reading was tested and found UNRELIABLE: the Finance block's 6 activity slots are 100% blank (verified -- no Hoshin Priority/Plan/Target/Support/Lead text anywhere) yet show the exact same fill pattern as populated activities elsewhere (first/last physical row of the group fully filled across all 15 months, with inner rows missing fill only at Nov'25/Dec'25). Since that pattern occurs with zero real data behind it, it is template/formatting noise, not user-entered Gantt data. Only 2 of ~31 activities (HR & ODG rows 47-51 and 53-57) show a genuinely different pattern: EVERY physical row, including first and last, unanimously excludes Oct/Nov/Dec 2025 -- that full-row unanimity is what distinguishes a deliberate edit from the template artifact. Rule applied: treat the fill pattern as a real partial-range signal only if Oct'25 (col G) is unfilled in a strict majority of the activity's physical rows (the noise pattern never touches Oct'25); if so, timeline.start/end/months are the union of filled columns across all rows and timeline.confidence = 'derived-from-fill-gap'. Otherwise the activity is reported as the full Oct'25-Dec'26 range with timeline.confidence = 'unverified-default-full-range' -- meaning no reliable partial-range signal was found, NOT a confirmed 15-month commitment. Only the 2 HR & ODG activities above carry 'derived-from-fill-gap'; every other activity in this file (29 of 31) carries 'unverified-default-full-range', so downstream consumers should not treat start/end as a hard commitment for those.","objectiveMapping": "The 5 canonical WE 2026 objectives (Financial Performance, Acquisitions, Organizational Development, Branding Solution, New Customer Acquisition + Lifetime Journey) come from the companion deck '2026 Hoshin Ojectives V-3.pdf' in the same project folder. 3 of the 5 appear verbatim as literal '(Priority: X)' tags inside Hoshin Priority cells (IT + Commercialization blocks); all 5 appear as verbatim, word-for-word quotes of the deck's objective descriptions in the Marketing block. objectiveId links an activity to its objective via (a) the explicit tag, (b) an exact verbatim-quote match, or (c) an unambiguous name/alias match ('Organizational Development' or 'Org Dev' as the literal priority label, 'New Customer Acquisition' as a leading phrase, or an explicit 'NN% Gross margin'/'GM' figure -- the latter is proven synonymous with the Financial Performance tag by Commercialization rows that carry BOTH forms, e.g. '150M 57.5% GM (Priority: Financial Performance)'). This linking logic never edits the stored verbatim text. Where a Hoshin Priority cell names more than one objective (slash-separated compound label, e.g. '57.5% Gross margin/ Organizational development'), objectiveId holds the first-listed objective and objectiveIds (non-null) holds the full ordered set; the raw hoshinPriority text always retains all of the original wording. Each objectives[] entry's 'description' field holds that objective's canonical 2026 one-year Hoshin priority, copied verbatim from the owner-provided '1-Year Hoshin Priorities' slide (received 2026-07-09). All 5 come from that single authoritative slide, including acquisitions ('Fully integrate HPI/EEI (ERP, CRM, reporting), realize 70% synergies, cross-train reps, build pipeline.'). This SUPERSEDES the earlier verbose text that had been lifted from the Marketing-block hoshinPriority cells (an older 'V-3' deck) and the interim SYNTHESIZED acquisitions summary; the descriptionProvenance flag was removed since no description is synthesized anymore. Corrected figures vs the prior V-3 text: revenue $150M (was $200M), gross margin 55% (was 60%), IL-market lock-down 70%+ (was 85%). The Marketing-block activities still retain their own verbatim hoshinPriority cells unchanged (those are activity-level text, distinct from these objective-level summaries).","deptMapping": {"hr": "HR & ODG block, duplicated. Block has a single functional lead (Eric Freeman) covering both HR and ODG jointly; individual activities mix HR process content (career path, comp, training, onboarding) with an 'Organizational Development' priority label and don't cleanly separate by department, so all 10 activities are duplicated into both hr and odg.","odg": "See hr -- same source block, same activities, duplicated by design.","sales": "Commercialization block (Tony Morando), routed here in full. All 4 activities are outside/inside sales & account-expansion revenue plays.","service": "Commercialization block did NOT clearly cover Service (no activity mentions customer service); originally left empty rather than duplicating unrelated sales content into it. SUPERSEDED per owner direction (2026-07): Service has the same Hoshin objectives, priorities, and activities as Sales -- Service is now deliberately aliased to Sales/Commercialization via aliasOf (see departments.service.aliasOf, consumed by lib/hoshin.js's activitiesFor()) rather than left empty or duplicated. No new activity text was authored -- activitiesFor() resolves Service to Sales's same 4 verbatim activities above at read time.","operations": "Operations block (Jim Kozel), routed here in full (6 activities).","logistics": "Operations block, duplicated ONLY for the one activity whose Support Function explicitly names 'logistics' (the pricing/tariffs/shipping-GM activity, rows 124-128) -- its target ('Increase GM on shipping by 5%') also matches the logistics dept's headlineKpi ('WE Shipping Margin') in departments.json. The other 5 Operations activities have no logistics content.","marketing": "Marketing block (TBD functional lead), 1:1, no duplication needed.","it": "IT block (Phil Jarvis), 1:1, no duplication needed.","finance": "Finance block (Will Schwartz) has 6 structural activity slots in the sheet but ALL are blank (no Hoshin Priority/Activity Plan/Targets/Support/Lead text in any of them) -- activities: [] rather than fabricating placeholder content."},"knownAmbiguity": ["HR & ODG activity at rows 47-51 has a blank (single-space) Hoshin Priority cell; objectiveId is left null because neither that cell nor the Activity Plan text names a WE 2026 objective unambiguously (its Target does mention '150,000,000 Revenue Development Growth', which is suggestive of Financial Performance, but this was not treated as strong enough evidence to auto-link).","'(Priority: Organizational  Development)' at IT row 207 has a literal double-space typo in the source cell; the canonical objectives list uses the correctly-spaced tag from row 220 ('(Priority: Organizational Development)') as priorityTag, but classification matching normalizes whitespace so both variants resolve to the same objectiveId."]},"objectives": [{"id": "financial-performance","name": "Financial Performance","priorityTag": "(Priority: Financial Performance)","description": "$150M revenue, 55% GM, e-comm baseline 5–10%, cash cycle reduced by 5–10 days. 7% NVAW crossover to VAW"},{"id": "acquisitions","name": "Acquisitions","priorityTag": "(Priority: Acquisitions)","description": "Fully integrate HPI/EEI (ERP, CRM, reporting), realize 70% synergies, cross-train reps, build pipeline."},{"id": "organizational-development","name": "Organizational Development","priorityTag": "(Priority: Organizational Development)","description": "Complete RACI, launch leadership training, embed Hoshin/FMDS, tie comp to KPI Performance."},{"id": "branding-solution","name": "Branding Solution","priorityTag": null,"description": "Lock down IL market (70%+), pilot LEO/Public Safety and workwear/fashion, refresh brand story & catalogs."},{"id": "new-customer-acquisition-lifetime-journey","name": "New Customer Acquisition + Lifetime Journey","priorityTag": null,"description": "5-min onboarding, CRM flags lifetime vs transactional, retention campaigns pilot, NPS capture."}],"departments": {"hr": {"block": "HR & ODG","functionalLead": "Eric Freeman","activities": [{"hoshinPriority": "Organizational Development #2 - 7% NVAW crossover to VAW","objectiveId": "organizational-development","objectiveIds": null,"activityPlan": "HR Structure Change- Organizational changes within the HR department. Restructuing roles to add L&D Manager to support WE career path and training management.","target": "1- New HR structure by Q425/Q2226\n2- 9% NAVW cross over to VAW - Q426","supportFunction": "HR","lead": "Clarissa L.","timeline": {"start": "Oct'25","end": "Dec'26","months": ["Oct'25","Nov'25","Dec'25","Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "unverified-default-full-range"}},{"hoshinPriority": null,"objectiveId": null,"objectiveIds": null,"activityPlan": "Structure Change- Organizational changes and  restructuing roles for proper career path and training management primarily focusing on Sales, Marketing and HR","target": "150,000,000 Revenue Development Growth\n9% NAVW cross over to VAW - Q226","supportFunction": "TM\nRC\nODG/HR","lead": "RC/EF\nRC/EF\nRC/EF","timeline": {"start": "Jan'26","end": "Dec'26","months": ["Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "derived-from-fill-gap"}},{"hoshinPriority": "Organizational Development","objectiveId": "organizational-development","objectiveIds": null,"activityPlan": "Career Development Path - Deployment of a career path for all functions that is supported by training for each level","target": "Milestone: 100% rollout by Q426\nSRR Target Score\n-\tInitial 60% - 80% \n-\tFinal target within one year – 80%","supportFunction": "ELT Team\nHR/ODG","lead": "L&D Manager\nAD","timeline": {"start": "Jan'26","end": "Dec'26","months": ["Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "derived-from-fill-gap"}},{"hoshinPriority": "Organizational Development & 7% NVAW crossover to VAW","objectiveId": "organizational-development","objectiveIds": null,"activityPlan": "ADP LMS System\n1-\tDevelopment and Deployment of LMS System\n2-\tTraining & Implementation of LMS System                         3-       Link to SRR","target": "Milestone: 100% rollout by Q426\nTarget: \n1.\tFunctions onboarding reduction time by 50%\n2.\t9% NAVW cross over to VAW - Q425\n3.       SRR 100% roll out","supportFunction": "ADP\nODG\nAll Functions","lead": "Talent Spec.\nEF/AD\nTalent Spec.","timeline": {"start": "Oct'25","end": "Dec'26","months": ["Oct'25","Nov'25","Dec'25","Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "unverified-default-full-range"}},{"hoshinPriority": "Organizational Development","objectiveId": "organizational-development","objectiveIds": null,"activityPlan": "Succesion Plan-  Have a talent pipeline with the right leadership ready to sustain growth, expansion aligned with a career path","target": "Bench Depth Ratio: Average number of successors per key role\nTarget: \n•\tReady Now A ≥ 1 successors for key roles\n•\tReady Later B (12-24 months) ≥ 2 successors for key roles \n•\tReady Later C (3-5 years) ≥ 2 successors for key roles","supportFunction": "ELT\nODG\nFunct. Leaders\nFunct. Leaders","lead": "Clarissa L.\nEF\nL&D Manager\nL&D Manager","timeline": {"start": "Oct'25","end": "Dec'26","months": ["Oct'25","Nov'25","Dec'25","Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "unverified-default-full-range"}},{"hoshinPriority": "Organizational Development","objectiveId": "organizational-development","objectiveIds": null,"activityPlan": "Compensation & Bonus structure- Develop, Deploy and Implement a formal salary structure with a bonus program that ties to KPI performance and SRR Audits","target": "1.   % of EE below 50% (risk zone)\n2.   % of EE above 120% (over-market)                      3.   100% linked to Performance Evaluations and SRR","supportFunction": "Funct Mgrs\nCSO/ FIN\nHR Wise/ELT/ADP","lead": "Talent Specialist\nClarissa L.\nHR Mgr","timeline": {"start": "Oct'25","end": "Dec'26","months": ["Oct'25","Nov'25","Dec'25","Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "unverified-default-full-range"}},{"hoshinPriority": "Organizational                          Development","objectiveId": "organizational-development","objectiveIds": null,"activityPlan": "Training and Development-Develop, Deploy and Implement a formal training structure including new hires and a formal onboarding process","target": "1. 100% of all Onboarding utilizing Training Plans        2.  2x Checks of Training Plan utilization                     3.  100% Linkage of development to Revenue through FMDS                                                                    4. 150,000,000 Revenue Development Growth              5. FMDS Delpoyment 100% Company wide","supportFunction": "ODG\nHR\nDivisional Manager & ELT","lead": "EF and AD\nClarissa L.\nAdm and Op's","timeline": {"start": "Oct'25","end": "Dec'26","months": ["Oct'25","Nov'25","Dec'25","Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "unverified-default-full-range"}},{"hoshinPriority": "Organizational                        Development","objectiveId": "organizational-development","objectiveIds": null,"activityPlan": "Training and Development- Create a formal development plan, a defined structure, and synchronized processes, limiting bench strength, accountability, and scalability to support organizational growth.","target": "1. 100% of all Onboarding utilizing Training Plans\n2.  2x Checks of Training Plan utilization\n3.  100% Linkage of development to Revenue through FMDS                                                                    4. 150,000,00 revenue growth                                                          5. 100% Training Structure at all levels","supportFunction": "ODG\nHR\nDivisional Manager","lead": "EF and AD\nClarissa L.\nAdm and Op's","timeline": {"start": "Oct'25","end": "Dec'26","months": ["Oct'25","Nov'25","Dec'25","Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "unverified-default-full-range"}},{"hoshinPriority": "Organizational                        Development","objectiveId": "organizational-development","objectiveIds": null,"activityPlan": "Training and Development-  Utilize UK Lean Institute students ability to 8 step problem solve through cross functional problems.  (One per quarter per member and Monthly Qulity Meeting) focusing on systems and process improvements","target": "1. 100% of UK Lean Students utilizing 8-step Quarterly deep dive Problems and Monthly Quality report out                                                               2.  100% tracked to SQDC-ODG  FMDS                                    3.  100% Linkage of development to Revenue through FMDS and Propblem Solving","supportFunction": "ODG\nHR\nDivisional Manager & ELT","lead": "EF and AD\nClarissa L.\nAdm and Op's","timeline": {"start": "Oct'25","end": "Dec'26","months": ["Oct'25","Nov'25","Dec'25","Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "unverified-default-full-range"}},{"hoshinPriority": "Organizational                        Development","objectiveId": "organizational-development","objectiveIds": null,"activityPlan": "Succesion Plan-  Train in Leadership Application, competencies, to strengthen internal talent pipelines, reduce backfill costs, and support succession gaps in key roles through training deployment","target": "1.100% SUP and below training Completion                                       2. 150,000,000 Revenue Development Growth\n3. SRR target 80%","supportFunction": "ODG\nHR\nDivisional Manager","lead": "EF and AD\nClarissa L.\nAdm and Op's","timeline": {"start": "Oct'25","end": "Dec'26","months": ["Oct'25","Nov'25","Dec'25","Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "unverified-default-full-range"}}]},"odg": {"block": "HR & ODG","functionalLead": "Eric Freeman","activities": [{"hoshinPriority": "Organizational Development #2 - 7% NVAW crossover to VAW","objectiveId": "organizational-development","objectiveIds": null,"activityPlan": "HR Structure Change- Organizational changes within the HR department. Restructuing roles to add L&D Manager to support WE career path and training management.","target": "1- New HR structure by Q425/Q2226\n2- 9% NAVW cross over to VAW - Q426","supportFunction": "HR","lead": "Clarissa L.","timeline": {"start": "Oct'25","end": "Dec'26","months": ["Oct'25","Nov'25","Dec'25","Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "unverified-default-full-range"}},{"hoshinPriority": null,"objectiveId": null,"objectiveIds": null,"activityPlan": "Structure Change- Organizational changes and  restructuing roles for proper career path and training management primarily focusing on Sales, Marketing and HR","target": "150,000,000 Revenue Development Growth\n9% NAVW cross over to VAW - Q226","supportFunction": "TM\nRC\nODG/HR","lead": "RC/EF\nRC/EF\nRC/EF","timeline": {"start": "Jan'26","end": "Dec'26","months": ["Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "derived-from-fill-gap"}},{"hoshinPriority": "Organizational Development","objectiveId": "organizational-development","objectiveIds": null,"activityPlan": "Career Development Path - Deployment of a career path for all functions that is supported by training for each level","target": "Milestone: 100% rollout by Q426\nSRR Target Score\n-\tInitial 60% - 80% \n-\tFinal target within one year – 80%","supportFunction": "ELT Team\nHR/ODG","lead": "L&D Manager\nAD","timeline": {"start": "Jan'26","end": "Dec'26","months": ["Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "derived-from-fill-gap"}},{"hoshinPriority": "Organizational Development & 7% NVAW crossover to VAW","objectiveId": "organizational-development","objectiveIds": null,"activityPlan": "ADP LMS System\n1-\tDevelopment and Deployment of LMS System\n2-\tTraining & Implementation of LMS System                         3-       Link to SRR","target": "Milestone: 100% rollout by Q426\nTarget: \n1.\tFunctions onboarding reduction time by 50%\n2.\t9% NAVW cross over to VAW - Q425\n3.       SRR 100% roll out","supportFunction": "ADP\nODG\nAll Functions","lead": "Talent Spec.\nEF/AD\nTalent Spec.","timeline": {"start": "Oct'25","end": "Dec'26","months": ["Oct'25","Nov'25","Dec'25","Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "unverified-default-full-range"}},{"hoshinPriority": "Organizational Development","objectiveId": "organizational-development","objectiveIds": null,"activityPlan": "Succesion Plan-  Have a talent pipeline with the right leadership ready to sustain growth, expansion aligned with a career path","target": "Bench Depth Ratio: Average number of successors per key role\nTarget: \n•\tReady Now A ≥ 1 successors for key roles\n•\tReady Later B (12-24 months) ≥ 2 successors for key roles \n•\tReady Later C (3-5 years) ≥ 2 successors for key roles","supportFunction": "ELT\nODG\nFunct. Leaders\nFunct. Leaders","lead": "Clarissa L.\nEF\nL&D Manager\nL&D Manager","timeline": {"start": "Oct'25","end": "Dec'26","months": ["Oct'25","Nov'25","Dec'25","Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "unverified-default-full-range"}},{"hoshinPriority": "Organizational Development","objectiveId": "organizational-development","objectiveIds": null,"activityPlan": "Compensation & Bonus structure- Develop, Deploy and Implement a formal salary structure with a bonus program that ties to KPI performance and SRR Audits","target": "1.   % of EE below 50% (risk zone)\n2.   % of EE above 120% (over-market)                      3.   100% linked to Performance Evaluations and SRR","supportFunction": "Funct Mgrs\nCSO/ FIN\nHR Wise/ELT/ADP","lead": "Talent Specialist\nClarissa L.\nHR Mgr","timeline": {"start": "Oct'25","end": "Dec'26","months": ["Oct'25","Nov'25","Dec'25","Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "unverified-default-full-range"}},{"hoshinPriority": "Organizational                          Development","objectiveId": "organizational-development","objectiveIds": null,"activityPlan": "Training and Development-Develop, Deploy and Implement a formal training structure including new hires and a formal onboarding process","target": "1. 100% of all Onboarding utilizing Training Plans        2.  2x Checks of Training Plan utilization                     3.  100% Linkage of development to Revenue through FMDS                                                                    4. 150,000,000 Revenue Development Growth              5. FMDS Delpoyment 100% Company wide","supportFunction": "ODG\nHR\nDivisional Manager & ELT","lead": "EF and AD\nClarissa L.\nAdm and Op's","timeline": {"start": "Oct'25","end": "Dec'26","months": ["Oct'25","Nov'25","Dec'25","Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "unverified-default-full-range"}},{"hoshinPriority": "Organizational                        Development","objectiveId": "organizational-development","objectiveIds": null,"activityPlan": "Training and Development- Create a formal development plan, a defined structure, and synchronized processes, limiting bench strength, accountability, and scalability to support organizational growth.","target": "1. 100% of all Onboarding utilizing Training Plans\n2.  2x Checks of Training Plan utilization\n3.  100% Linkage of development to Revenue through FMDS                                                                    4. 150,000,00 revenue growth                                                          5. 100% Training Structure at all levels","supportFunction": "ODG\nHR\nDivisional Manager","lead": "EF and AD\nClarissa L.\nAdm and Op's","timeline": {"start": "Oct'25","end": "Dec'26","months": ["Oct'25","Nov'25","Dec'25","Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "unverified-default-full-range"}},{"hoshinPriority": "Organizational                        Development","objectiveId": "organizational-development","objectiveIds": null,"activityPlan": "Training and Development-  Utilize UK Lean Institute students ability to 8 step problem solve through cross functional problems.  (One per quarter per member and Monthly Qulity Meeting) focusing on systems and process improvements","target": "1. 100% of UK Lean Students utilizing 8-step Quarterly deep dive Problems and Monthly Quality report out                                                               2.  100% tracked to SQDC-ODG  FMDS                                    3.  100% Linkage of development to Revenue through FMDS and Propblem Solving","supportFunction": "ODG\nHR\nDivisional Manager & ELT","lead": "EF and AD\nClarissa L.\nAdm and Op's","timeline": {"start": "Oct'25","end": "Dec'26","months": ["Oct'25","Nov'25","Dec'25","Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "unverified-default-full-range"}},{"hoshinPriority": "Organizational                        Development","objectiveId": "organizational-development","objectiveIds": null,"activityPlan": "Succesion Plan-  Train in Leadership Application, competencies, to strengthen internal talent pipelines, reduce backfill costs, and support succession gaps in key roles through training deployment","target": "1.100% SUP and below training Completion                                       2. 150,000,000 Revenue Development Growth\n3. SRR target 80%","supportFunction": "ODG\nHR\nDivisional Manager","lead": "EF and AD\nClarissa L.\nAdm and Op's","timeline": {"start": "Oct'25","end": "Dec'26","months": ["Oct'25","Nov'25","Dec'25","Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "unverified-default-full-range"}}]},"sales": {"block": "COMMERCIALIZATION","functionalLead": "Tony Morando","activities": [{"hoshinPriority": "150M % 57.5 GM (Priority: Financial Performance)","objectiveId": "financial-performance","objectiveIds": null,"activityPlan": "Expansion revenue within our core accounts of $20M","target": "KPI: Retention $ = $15M\n\nKPI: $ from converted accounts = 5M","supportFunction": "Operations\nIT\nMarketing","lead": "Tamara (Strategic Activities)\nNoel & JC (Activity Assurance)","timeline": {"start": "Oct'25","end": "Dec'26","months": ["Oct'25","Nov'25","Dec'25","Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "unverified-default-full-range"}},{"hoshinPriority": "150M 57.5% GM (Priority: Financial Performance)","objectiveId": "financial-performance","objectiveIds": null,"activityPlan": "Acquire new customers in high value segments by outside sales with a goal of $20M","target": "KPI: # of new customers \n\nKPI: $ from net new customers \n\nKPI: time to first $500k in net new for new hires","supportFunction": "Marketing\nIT\nOperations","lead": "Tony Morando (Strategic Activity)","timeline": {"start": "Oct'25","end": "Dec'26","months": ["Oct'25","Nov'25","Dec'25","Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "unverified-default-full-range"}},{"hoshinPriority": "$150M 57.5% GM (Priority: Financial Performance)","objectiveId": "financial-performance","objectiveIds": null,"activityPlan": "Expand inside sales to achieve $10M in revenue.","target": "KPI: $ from reactivated accounts \n\n\nKPI: Quote to win rate \n\n\nKPI: Incoming $\n\n\nKPI: Ave lead response time","supportFunction": "Sales & Marketing \n\n\nIT & Sales Leadership \n\n\nOperations & Marketing \n\n\nRev Ops & Sales Leadership","lead": "Tony Morando (Stategic Activity)","timeline": {"start": "Oct'25","end": "Dec'26","months": ["Oct'25","Nov'25","Dec'25","Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "unverified-default-full-range"}},{"hoshinPriority": "Org Dev","objectiveId": "organizational-development","objectiveIds": null,"activityPlan": "Lean system Development $20M in revenue.","target": "KPI: Mangers 100% trained in all Lean Training                                                                                                \n\nKPI: TL's and TMs have 100% Basic Lean Training       \n\nKPI: Tl's 100% Trained in Leadership Application","supportFunction": "ODG & HR","lead": "Alison Diaco / Eric Freeman","timeline": {"start": "Oct'25","end": "Dec'26","months": ["Oct'25","Nov'25","Dec'25","Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "unverified-default-full-range"}}]},"service": {"block": "COMMERCIALIZATION","functionalLead": "Tony Morando","aliasOf": "sales","activities": []},"operations": {"block": "OPERATIONS","functionalLead": "Jim Kozel","activities": [{"hoshinPriority": "57.5% Gross margin/ Organizational development","objectiveId": "financial-performance","objectiveIds": ["financial-performance","organizational-development"],"activityPlan": "Labor efficiency improved by 9%","target": "Training completed by June\nUPLH improvement by 2% q1, 2% Q2, 3% Q3, 2% Q4\nWPS complete by end of Q1 of 2026\nnet increase of price increase to be $1M for WE","supportFunction": "ODG\nIT\nHR\nPricing","lead": "PM","timeline": {"start": "Oct'25","end": "Dec'26","months": ["Oct'25","Nov'25","Dec'25","Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "unverified-default-full-range"}},{"hoshinPriority": "57.5% Gross margin","objectiveId": "financial-performance","objectiveIds": null,"activityPlan": "Material decreased by 10%","target": "Alternative leather produducer producing by end of Q2\nWaste elimination efforts in all plants netting a 15% improvement in scrap\nFinish WMS by end of Q4","supportFunction": "ENG\nR&D\nPM\nIT","lead": "Purch","timeline": {"start": "Oct'25","end": "Dec'26","months": ["Oct'25","Nov'25","Dec'25","Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "unverified-default-full-range"}},{"hoshinPriority": "57.5% Gross margin/ 10% NVAW crossover to VAW/Organizational Development","objectiveId": "financial-performance","objectiveIds": ["financial-performance","organizational-development"],"activityPlan": "Indirect labor decreased by 15%","target": "Decrease 1 supervisor per location by Q2\ndecrease 1 maintenance person by location by Q2\nEliminate reliance on Brent by Q3\nDecrease Art/Digizing by 50% by end of year","supportFunction": "HR\nIT","lead": "PM","timeline": {"start": "Oct'25","end": "Dec'26","months": ["Oct'25","Nov'25","Dec'25","Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "unverified-default-full-range"}},{"hoshinPriority": "57.5% Gross margin","objectiveId": "financial-performance","objectiveIds": null,"activityPlan": "Decrease impact on expenses related to production by $700,000 by end of year","target": "Maintain a 15% below budget on factory supplies and Repairs and Maint (93,000)\nIncrease GM on shipping by 5% ($440,000)\nIncrease prices to make tariffs a net zero cost ($140,000)\nInbound duties decrease by 10%\nPrice increase HP by 4%","supportFunction": "Purc\nPricing\nlogistics","lead": "PM","timeline": {"start": "Oct'25","end": "Dec'26","months": ["Oct'25","Nov'25","Dec'25","Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "unverified-default-full-range"}},{"hoshinPriority": "Organizational Development","objectiveId": "organizational-development","objectiveIds": null,"activityPlan": "Lean systems development","target": "Exec Team True Lean trained by End of Year\n1 level down from exec team trained in true lean by end of year\n8 step problem solving for lead level all departments\nSRR score of 80% by end of year all departments","supportFunction": "HR\nODG","lead": "Team Champ","timeline": {"start": "Oct'25","end": "Dec'26","months": ["Oct'25","Nov'25","Dec'25","Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "unverified-default-full-range"}},{"hoshinPriority": "New Customer Acquisition & Lifetime Journey","objectiveId": "new-customer-acquisition-lifetime-journey","objectiveIds": null,"activityPlan": "Onboarding New Accounts over $500k annualy","target": "Create SW for onboarding new retail, new IL and large existing IL","supportFunction": null,"lead": null,"timeline": {"start": "Oct'25","end": "Dec'26","months": ["Oct'25","Nov'25","Dec'25","Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "unverified-default-full-range"}}]},"logistics": {"block": "OPERATIONS","functionalLead": "Jim Kozel","activities": [{"hoshinPriority": "57.5% Gross margin","objectiveId": "financial-performance","objectiveIds": null,"activityPlan": "Decrease impact on expenses related to production by $700,000 by end of year","target": "Maintain a 15% below budget on factory supplies and Repairs and Maint (93,000)\nIncrease GM on shipping by 5% ($440,000)\nIncrease prices to make tariffs a net zero cost ($140,000)\nInbound duties decrease by 10%\nPrice increase HP by 4%","supportFunction": "Purc\nPricing\nlogistics","lead": "PM","timeline": {"start": "Oct'25","end": "Dec'26","months": ["Oct'25","Nov'25","Dec'25","Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "unverified-default-full-range"}}]},"marketing": {"block": "MARKETING","functionalLead": "TBD","activities": [{"hoshinPriority": "Grow revenue to $200m through channel management, ecomm, marketplaces, and acquisitions while achieving [60%] in margin and 80% cash conversion through operational performance and tech innovations.  ​","objectiveId": "financial-performance","objectiveIds": null,"activityPlan": "Grow e-commerce revenue to 6MM of total revenue and improve site conversion to ≥2.5% by FY26 through OPT stabilization, AI Designer commercialization, and platform optimization.","target": "Blended Site Conversion Rate ≥2.5%\nE-commerce Revenue (6mm) on pace\nAI Designer Adoption & AI-Influenced Revenue (get with JK and PJ re: the ROI) - we want what % of design work flowing through this","supportFunction": "IT\nOperations\nFinance","lead": "Head of Demand Marketing (CM)","timeline": {"start": "Oct'25","end": "Dec'26","months": ["Oct'25","Nov'25","Dec'25","Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "unverified-default-full-range"}},{"hoshinPriority": "Grow revenue to $200m through channel management, ecomm, marketplaces, and acquisitions while achieving [60%] in margin and 80% cash conversion through operational performance and tech innovations.","objectiveId": "financial-performance","objectiveIds": null,"activityPlan": "Establish marketing-sourced pipeline measurement discipline and grow MSP by 15% in H2 while achieving ≥25% MQL→SQL conversion.","target": "Marketing-Sourced Revenue ($ & % of total)\nMQL → SQL Conversion ≥25%\nLaunch revenue target achieved within 30 days\n100% sales enablement delivery before launch","supportFunction": "Sales\nFinance\nIT","lead": "Head of Demanad Marketing (CM), CSO ™","timeline": {"start": "Oct'25","end": "Dec'26","months": ["Oct'25","Nov'25","Dec'25","Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "unverified-default-full-range"}},{"hoshinPriority": "Create a clear structure for roles &\nresponsibilities supported by a\nsystematic staff development program\nand empowerment to drive individual\nand company-wide success.","objectiveId": "organizational-development","objectiveIds": null,"activityPlan": "Improve marketing execution speed by 20% and achieve 100% KPI ownership and ≥95% data accuracy by FY26","target": "% Roles with Defined KPIs = 100%\nHubSpot Adoption by Role (How to score)\nSRR Target of 80%","supportFunction": "HR\nIT\nSales","lead": "CMO","timeline": {"start": "Oct'25","end": "Dec'26","months": ["Oct'25","Nov'25","Dec'25","Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "unverified-default-full-range"}},{"hoshinPriority": "Develop end-to-end first-time customer\njourney onboarded within 5 minutes\ntracking and identifying customers that\nare lifetime vs transactional vs\nsometimes customers​","objectiveId": "new-customer-acquisition-lifetime-journey","objectiveIds": null,"activityPlan": "Increase repeat purchase rate and revenue from existing customers by 15% by FY26 through lifecycle automation and CRM discipline.","target": "Repeat Purchase / Reorder Rate +15%\nRevenue Mix: Lifetime vs Transactional\nConversion from Lifecycle Automations","supportFunction": "Sales\nIT\nCustomer Service","lead": "CMO\nLifecycle Marketing","timeline": {"start": "Oct'25","end": "Dec'26","months": ["Oct'25","Nov'25","Dec'25","Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "unverified-default-full-range"}},{"hoshinPriority": "Develop end-to-end branding solutions\ndominating the IL market (85%), top\nprovider in LEO/Public Safety, becoming\nstrategic partners, establishing our\npresence in workwear, and fashion.​","objectiveId": "branding-solution","objectiveIds": null,"activityPlan": "Standardize brand and sales messaging to reduce custom content requests by 25% and improve sales asset adoption by FY26.","target": "Sales Adoption of Standardized Materials\nSales Feedback Score on Enablement Assets","supportFunction": "Sales\nProduct\nOperations","lead": "CMO\nHead of Brand (PC)","timeline": {"start": "Oct'25","end": "Dec'26","months": ["Oct'25","Nov'25","Dec'25","Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "unverified-default-full-range"}}]},"it": {"block": "IT","functionalLead": "Phil Jarvis","activities": [{"hoshinPriority": "Project Titan/AI (WEVision)\n(Priority: Financial Performance)","objectiveId": "financial-performance","objectiveIds": null,"activityPlan": "Utilizing a plethora of new AI tools, in order to improve internal training and efficiency, improve customer experience utilizing self-help, interactive AI tools, while decreasing order, digitizating and customer service time using simulated and digitized embroidery images and files, monetizing our design request asset library, and AI auto-generated images based on customer input.","target": "- AIDaaS (Erica Briones-Fractional Chief AI Officer) - At least one initiative per department head, while paying for the engagement\n- Internal training - Monthly Training and/or Viva Engage posts on key topics\n- In-House User AI Tools - Expedient by 10/15; Other by 12/31 for Consistency, F7Security, and Savings - 250 licenses = $39K/year\n- v1.0 AI Customer Experience (Optimize Image, and users select Eagle Eye or Image Reference Search)\n- v1.2 Simulated Samples with Google Gemini immediately creating a Digital Passport, sending samples to Art Team - 75% of customers using this tool place orders (Pilot 12/25)\n- v1.3 Implement EpiServer Pricing Upcharges and Increased Turn Times for Poor Quality Scale Images (Pilot 1/26)\n- v1.5 HPI/Galls/Customer Samples using Color Charts, import into WE format and Optimizely/EpiServer\n- v1.6 Automated Ordering Based on PO (Saves Order Entry manual input time)\n- v1.75 Simulated Samples (Phase 2); All products and any additional enhancements\n- Cintas PDFs/Invoices\n- Auto-Generateed Images from customer text (E.g., Stickers) - 5% Revenue Lift\n- AI Chat - Self-help for customers contacting Customer Service, one-call resolution on 80% of the chats\nFUTURE CONSIDERATIONS\n- CustomGenie Integration\n- Monetizing our Design Request Asset Library - 2026-$100K, 2027-$500K\n- Digitized Embroidery Designs - $180K annualized savings to begin in 2028\n- Others (Freight, Operational Analytics, etc.)","supportFunction": "Sales\nAccounting\nOPs\nMarketing\nHR\nIT","lead": "Nick Chapman","timeline": {"start": "Oct'25","end": "Dec'26","months": ["Oct'25","Nov'25","Dec'25","Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "unverified-default-full-range"}},{"hoshinPriority": "NetSuite-->BC365 Migration\n(Priority: Acquisitions)","objectiveId": "acquisitions","objectiveIds": null,"activityPlan": "In order to fully decommission the HPI ERP system (eliminating 1 of the 3 existing systems) and ancillary software, migrating it to our existing BC365 system, completing the HPI Acquisiton project while seeing the savings from the software in future years.","target": "- Elimination of HPI ERP system and ancillary software\n- $100K/Annualized (Starting in 2027) for the NetSuite and ancillary software","supportFunction": "Accounting\nOPs","lead": "Gabe Rodriguez","timeline": {"start": "Oct'25","end": "Dec'26","months": ["Oct'25","Nov'25","Dec'25","Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "unverified-default-full-range"}},{"hoshinPriority": "New Era Reset, HPI-->Optimizely/EpiServer Migration & Quoting System\n(Priority: Acquisitions)","objectiveId": "acquisitions","objectiveIds": null,"activityPlan": "- In order to do a New Era Reset and pull together Anonymous Design, Guest Checkout, New Era, etc. getting them all under one roof and eliminating future \"Undefined\" projects to finish this all up.\n- In order to fully decommission the HPI eCommerce System running on BigCommerce (eliminating BigCommerce), migrating it to our Optimizely/EpiSever environment.\n- In order to create a Quoting System within Optimizely/EpiServer because the Hero's Pride Quoting System is going away with the migration, and World Emblem needs one.","target": "- 10% Revenue Lift","supportFunction": "Sales\nMarketing\nAccounting","lead": "Doug Swingle","timeline": {"start": "Oct'25","end": "Dec'26","months": ["Oct'25","Nov'25","Dec'25","Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "unverified-default-full-range"}},{"hoshinPriority": "Security\n(Priority: Organizational  Development)","objectiveId": "organizational-development","objectiveIds": null,"activityPlan": "In order to secure the World Emblem systems and software environment exceeding industry standards and establishing a world class secure environment, implement end-user training, PCI Compliance for our eCommerce systems, advanced AI-based monitoring tools, adhering to the CIS framework, monitored and scored by the Coalition and Security Scorecard independent systems, and decreasing and getting the best Cyber Insurance rate possible due to our security scores annually.","target": "- Implement an annual training with 3 quarterly reinforcement training sessions, along with random phishing campaigns\n- Score >90% (A-Rating) weekly on both Coalition and Security Scorecard\n- Get the best price (largest discount) for annual Cyber Insurance policy per our rating/score\n- File PCI by the end of the Calendar year with No Issues\n- CIS framework task completion","supportFunction": "Sales\nAccounting\nOPs\nMarketing\nHR\nIT","lead": "Martin Gonzalez","timeline": {"start": "Oct'25","end": "Dec'26","months": ["Oct'25","Nov'25","Dec'25","Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "unverified-default-full-range"}},{"hoshinPriority": "Pulse Nesting-Embroidery\n(Priority: Financial Performance)","objectiveId": "financial-performance","objectiveIds": null,"activityPlan": "In order to increase operational efficiency in our embroidery systems by nesting emblems utilize the least amount of material and space, improving operational throughput and material savings, implement the Pulse shape nesting solution.","target": "- 15% overall efficency gains\n- $250K in 2026; $350K Annualized in 2027","supportFunction": "OPs\nAccounting","lead": "Nick Chapman","timeline": {"start": "Oct'25","end": "Dec'26","months": ["Oct'25","Nov'25","Dec'25","Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "unverified-default-full-range"}},{"hoshinPriority": "IT Staffing & Development\n(Priority: Organizational Development)","objectiveId": "organizational-development","objectiveIds": null,"activityPlan": "In order to increase IT staff to bring in multiple projects that are currently Consultant led (Primarily WPS), and to add velocity to our current Azure DevOPs Project/Task Backlog.  In order to raise the bar in IT, and in alignment with HR's Hoshin and timelines, all IT staff will have Development Plans, Career Paths, Training, etc. while also preparing for Succession Management for key roles.","target": "- Bring in the dedicated WPS team in-house (and with True North InfoTek), realizing savings on resources\n- Utilize the WPS team savings (mentioned above) and utilize these dollars to add additional staff taking on additional velocity from the Azure DevOPs backlog and utilizing fewer resources from vendors (E.g., Hanson PMs/BAs)\n- Bring in an eCom Developer to help and prepare to backfill (Doug Swingle) with Optimizely/EpiServer and BigCommerce","supportFunction": "HR\nAccounting","lead": "Phil Jarvis","timeline": {"start": "Oct'25","end": "Dec'26","months": ["Oct'25","Nov'25","Dec'25","Jan'26","Feb'26","Mar'26","Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26","Oct'26","Nov'26","Dec'26"],"confidence": "unverified-default-full-range"}}]},"finance": {"block": "FINANCE","functionalLead": "Will Schwartz","activities": []}}},"data/hr.json": {"id": "hr","name": "HR","lead": "Clarissa","mechanism": "avg","rollupMethod": "avg","note": "Actuals originate from Bowler HR via INDEX formula — HRD does not enter per-person. Monthly cadence (JAN=row11, FEB=row12, MAR=row13).","kpis": [{"id": "trir","name": "TRIR Overall","level": 1,"isMain": true,"parentId": null,"target": 0,"actual": 1.2,"unit": "rate","direction": "lower_better","source": "ADP","targetSource": "Manual — reported","manualOnly": true,"agentPoke": true,"agentPokeNote": "ADP has no usable API — agent pings the HR owner on Slack, validates, then posts to board.","rollupMethod": "avg","contributors": ["trir_us","trir_mx","trir_cn","trir_norcross","trir_texas"],"flag": "Feb spike 30.80 — real cached value; likely a real safety-incident month but confirm not a data-entry artifact.","monthlyActuals": {"jan": 1.03,"feb": 30.8,"mar": 1.2},"series": [1.03,30.8,1.2]},{"id": "trir_us","name": "TRIR US","level": 2,"isMain": false,"parentId": "trir","target": 0,"actual": 2.356,"unit": "rate","direction": "lower_better","source": "ADP","targetSource": "Manual — reported","manualOnly": true,"agentPoke": true,"rollupMethod": null,"contributors": [],"flag": null,"monthlyActuals": {"jan": 1.957,"feb": 18.917,"mar": 2.356},"series": [1.957,18.917,2.356]},{"id": "trir_mx","name": "TRIR MX","level": 2,"isMain": false,"parentId": "trir","target": 0,"actual": 1.243,"unit": "rate","direction": "lower_better","source": "ADP","targetSource": "Manual — reported","manualOnly": true,"agentPoke": true,"rollupMethod": null,"contributors": [],"flag": null,"monthlyActuals": {"jan": 1.135,"feb": 1.309,"mar": 1.243},"series": [1.135,1.309,1.243]},{"id": "trir_cn","name": "TRIR Canada","level": 2,"isMain": false,"parentId": "trir","target": 0,"actual": 0,"unit": "rate","direction": "lower_better","source": "ADP","targetSource": "Manual — reported","manualOnly": true,"agentPoke": true,"rollupMethod": null,"contributors": [],"flag": "Feb spike 72.175 — real cached value; confirm not a data-entry artifact.","monthlyActuals": {"jan": 0,"feb": 72.175,"mar": 0},"series": [0,72.175,0]},{"id": "trir_norcross","name": "TRIR Norcross","level": 2,"isMain": false,"parentId": "trir","target": 0,"actual": 0,"unit": "rate","direction": "lower_better","source": "ADP","targetSource": "Manual — reported","manualOnly": true,"agentPoke": true,"rollupMethod": null,"contributors": [],"flag": null,"monthlyActuals": {"jan": 9.783,"feb": 22.41,"mar": 0},"series": [9.783,22.41,0]},{"id": "trir_texas","name": "TRIR Texas","level": 2,"isMain": false,"parentId": "trir","target": 0,"actual": 11.78,"unit": "rate","direction": "lower_better","source": "ADP","targetSource": "Manual — reported","manualOnly": true,"agentPoke": true,"rollupMethod": null,"contributors": [],"flag": null,"monthlyActuals": {"jan": 0,"feb": 0,"mar": 11.78},"series": [0,0,11.78]},{"id": "turnover","name": "Turnover Overall","level": 1,"isMain": true,"parentId": null,"target": 0.02,"actual": 0.00382,"unit": "ratio","direction": "lower_better","source": "ADP","targetSource": "ADP","agentPoke": true,"rollupMethod": "avg","contributors": ["turnover_us","turnover_mx","turnover_can"],"flag": null,"note": "Turnover column is CY (confirmed; not CZ as an earlier summary said).","monthlyActuals": {"jan": 0.00429,"feb": 0.00353,"mar": 0.00382},"series": [0.00429,0.00353,0.00382]},{"id": "turnover_us","name": "Turnover US","level": 2,"isMain": false,"parentId": "turnover","target": 0.02,"actual": 0.01393,"unit": "ratio","direction": "lower_better","source": "ADP","targetSource": "ADP","agentPoke": true,"rollupMethod": null,"contributors": [],"flag": null,"monthlyActuals": {"jan": 0.00478,"feb": 0.01322,"mar": 0.01393},"series": [0.00478,0.01322,0.01393]},{"id": "turnover_mx","name": "Turnover MX","level": 2,"isMain": false,"parentId": "turnover","target": 0.02,"actual": 0.00519,"unit": "ratio","direction": "lower_better","source": "ADP","targetSource": "ADP","agentPoke": true,"rollupMethod": null,"contributors": [],"flag": null,"monthlyActuals": {"jan": 0.00715,"feb": 0.00444,"mar": 0.00519},"series": [0.00715,0.00444,0.00519]},{"id": "turnover_can","name": "Turnover Canada","level": 2,"isMain": false,"parentId": "turnover","target": 0.02,"actual": 0,"unit": "ratio","direction": "lower_better","source": "ADP","targetSource": "ADP","agentPoke": true,"rollupMethod": null,"contributors": [],"flag": null,"monthlyActuals": {"jan": 0.00952,"feb": 0,"mar": 0},"series": [0.00952,0,0]},{"id": "satisfaction","name": "Employee Satisfaction","level": 1,"isMain": true,"parentId": null,"target": 4.5,"actual": 4.415,"unit": "score (1–5)","direction": "higher_better","source": "Survey (internal)","targetSource": "Survey (internal)","agentPoke": false,"rollupMethod": "avg","contributors": ["satisfaction_30d","satisfaction_60d","satisfaction_90d"],"flag": null,"monthlyActuals": {"jan": 4.613,"feb": 4.498,"mar": 4.415},"series": [4.613,4.498,4.415]},{"id": "satisfaction_30d","name": "Employee Satisfaction (30-day)","level": 2,"isMain": false,"parentId": "satisfaction","target": 4.5,"actual": 4.605,"unit": "score (1–5)","direction": "higher_better","source": "Survey","targetSource": "Survey (internal)","rollupMethod": null,"contributors": [],"flag": null,"monthlyActuals": {"jan": 4.69,"feb": 4.593,"mar": 4.605},"series": [4.69,4.593,4.605]},{"id": "satisfaction_60d","name": "Employee Satisfaction (60-day)","level": 2,"isMain": false,"parentId": "satisfaction","target": 4.5,"actual": 4.0,"unit": "score (1–5)","direction": "higher_better","source": "Survey","targetSource": "Survey (internal)","rollupMethod": null,"contributors": [],"flag": null,"monthlyActuals": {"jan": 4.662,"feb": 4.275,"mar": 4.0},"series": [4.662,4.275,4.0]},{"id": "satisfaction_90d","name": "Employee Satisfaction (90-day)","level": 2,"isMain": false,"parentId": "satisfaction","target": 4.5,"actual": 4.64,"unit": "score (1–5)","direction": "higher_better","source": "Survey","targetSource": "Survey (internal)","rollupMethod": null,"contributors": [],"flag": null,"monthlyActuals": {"jan": 4.486,"feb": 4.625,"mar": 4.64},"series": [4.486,4.625,4.64]},{"id": "glassdoor_usa","name": "Glassdoor USA","level": 2,"isMain": false,"parentId": "satisfaction","target": 4.8,"actual": 4.1,"unit": "score (1–5)","direction": "higher_better","source": "Glassdoor","targetSource": "Glassdoor","rollupMethod": null,"contributors": [],"flag": null,"monthlyActuals": {"jan": 4.1,"feb": 4.1,"mar": 4.1},"series": [4.1,4.1,4.1]},{"id": "glassdoor_mx","name": "Glassdoor MX","level": 2,"isMain": false,"parentId": "satisfaction","target": 4.8,"actual": 4.4,"unit": "score (1–5)","direction": "higher_better","source": "Glassdoor","targetSource": "Glassdoor","rollupMethod": null,"contributors": [],"flag": null,"monthlyActuals": {"jan": 4.4,"feb": 4.4,"mar": 4.4},"series": [4.4,4.4,4.4]},{"id": "indeed_us","name": "Indeed US","level": 2,"isMain": false,"parentId": "satisfaction","target": 4.0,"actual": 2.8,"unit": "score (1–5)","direction": "higher_better","source": "Indeed","targetSource": "Indeed","rollupMethod": null,"contributors": [],"flag": null,"monthlyActuals": {"jan": 2.8,"feb": 2.8,"mar": 2.8},"series": [2.8,2.8,2.8]},{"id": "time_to_fill_direct","name": "Time to Fill — Direct","level": 1,"isMain": true,"parentId": null,"target": 4,"actual": 2.842,"unit": "days","direction": "lower_better","source": "ADP","targetSource": "ADP","agentPoke": true,"rollupMethod": "avg","contributors": [],"flag": null,"monthlyActuals": {"jan": 2.467,"feb": 2.153,"mar": 2.842},"series": [2.467,2.153,2.842]},{"id": "time_to_fill_indirect","name": "Time to Fill — Indirect","level": 1,"isMain": true,"parentId": null,"target": 25,"actual": 25.25,"unit": "days","direction": "lower_better","source": "ADP","targetSource": "ADP","agentPoke": true,"rollupMethod": "avg","contributors": [],"flag": null,"monthlyActuals": {"jan": 12.5,"feb": 32.25,"mar": 25.25},"series": [12.5,32.25,25.25]},{"id": "bench_strength","name": "Leadership Bench Strength","level": 1,"isMain": false,"parentId": null,"target": null,"actual": null,"nodata": true,"nodataNote": "Bench Strength block is entirely empty placeholder in HRD (confirmed). No target defined.","unit": "score","direction": "higher_better","source": null,"targetSource": "TBD — no source system","rollupMethod": null,"contributors": [],"flag": null,"series": []},{"id": "leader_srr","name": "Leader SRR","level": 1,"isMain": false,"parentId": null,"target": null,"actual": null,"nodata": true,"nodataNote": "Leader SRR block is entirely empty in HRD — computed in ODG, not owned here.","unit": "ratio","direction": "higher_better","source": "ODG","targetSource": "ODG","rollupMethod": null,"contributors": [],"flag": null,"series": []}],"gaps": ["Bench Strength: entirely empty placeholder — no target, no actuals.","Leader SRR: empty in HRD — computed in ODG.","Turnover DR: blank (confirmed).","TRIR/DART FEB spikes (TRIR overall 30.8, CN 72.2) are real cached values — confirm not data-entry artifacts.","DART-overall formula known-buggy in sheet (points at TRIR cols) — cached actuals reflect that formula bug.","Location sets differ by KPI: TRIR/DART use US/MX/CN; Turnover uses US/MX/CAN/DR."]},"data/it.json": {"id": "it","name": "IT","lead": "Phil Jarvis","tier": 2,"mechanism": "manual","rollupMethod": "manual","note": "100% manual weekly entry (Phil: 'manual to date, Martin building it'). Units for ticket-closure KPIs are minutes (confirmed — Javier question resolved). Direction for ticket-closure KPIs is lower_better (faster = better).","kpis": [{"id": "uptime","name": "% Uptime","level": 1,"isMain": true,"parentId": null,"target": 0.998,"actual": 0.998,"unit": "ratio","direction": "higher_better","source": "Manual","targetSource": "Azure DevOps / monitoring","rollupMethod": "manual","contributors": ["uptime_servers","uptime_circuits"],"flag": null,"series": [0.998,0.998,0.999,0.998,0.9999,0.998,0.998,0.998]},{"id": "uptime_servers","name": "Uptime — Servers","level": 2,"isMain": false,"parentId": "uptime","target": 0.9999,"actual": 0.9999,"unit": "ratio","direction": "higher_better","source": "Manual","targetSource": "Azure DevOps / monitoring","rollupMethod": null,"contributors": [],"flag": null,"series": [0.9999,0.9999,0.9999,0.9999,0.9999,0.9999,0.9999,0.9999]},{"id": "uptime_circuits","name": "Uptime — Circuits","level": 2,"isMain": false,"parentId": "uptime","target": 0.9999,"actual": 0.9999,"unit": "ratio","direction": "higher_better","source": "Manual","targetSource": "Azure DevOps / monitoring","rollupMethod": null,"contributors": [],"flag": null,"series": [0.9999,0.9999,0.9999,0.9999,0.9999,0.9999,0.9999,0.9999]},{"id": "innovation","name": "% Innovation","level": 1,"isMain": true,"parentId": null,"target": 0.7,"actual": 0.7,"unit": "ratio","direction": "higher_better","source": "Azure DevOps","targetSource": "Azure DevOps","rollupMethod": "manual","contributors": ["sprint_burndown","azure_devops_pts"],"flag": null,"note": "Registry label: '% New Development' = this board's '% Innovation'.","series": [0.7,0.7,0.7,0.7,0.7,0.7,0.7,0.7]},{"id": "sprint_burndown","name": "Sprint Burndown","level": 2,"isMain": false,"parentId": "innovation","target": 50,"actual": 50,"unit": "pts","direction": "higher_better","source": "Azure DevOps","targetSource": "Azure DevOps","rollupMethod": null,"contributors": [],"flag": null,"illustrative": true,"series": [50]},{"id": "azure_devops_pts","name": "Azure DevOps Points","level": 2,"isMain": false,"parentId": "innovation","target": 70,"actual": 70,"unit": "pts","direction": "higher_better","source": "Azure DevOps","targetSource": "Azure DevOps","rollupMethod": null,"contributors": [],"flag": null,"illustrative": true,"series": [70]},{"id": "ticket_closure_p1","name": "Ticket Closure — P1","level": 1,"isMain": true,"parentId": null,"target": 60,"actual": 60,"unit": "minutes","direction": "lower_better","source": "Manual","targetSource": "Azure DevOps / monitoring","rollupMethod": "manual","contributors": [],"flag": null,"note": "Target 60 minutes. Lower is better — faster resolution = green.","series": [60,55,60,50,60,60,55,60]},{"id": "ticket_closure_p2","name": "Ticket Closure — P2","level": 1,"isMain": true,"parentId": null,"target": 120,"actual": 120,"unit": "minutes","direction": "lower_better","source": "Manual","targetSource": "Azure DevOps / monitoring","rollupMethod": "manual","contributors": [],"flag": null,"note": "Target 120 minutes. Lower is better.","series": [120,110,120,115,120,120,110,120]},{"id": "ticket_closure_p3","name": "Ticket Closure — P3","level": 1,"isMain": true,"parentId": null,"target": 240,"actual": 200,"unit": "minutes","direction": "lower_better","source": "Manual","targetSource": "Azure DevOps / monitoring","rollupMethod": "manual","contributors": [],"flag": null,"note": "Target 240 minutes. Actual 200 min = green (lower_better: 200 < 240). Registry shows 'P3 240→200' indicating current actual is 200.","series": [240,220,210,200,210,200,200,200]},{"id": "ticket_closure_p4","name": "Ticket Closure — P4","level": 1,"isMain": true,"parentId": null,"target": 1440,"actual": 1440,"unit": "minutes","direction": "lower_better","source": "Manual","targetSource": "Azure DevOps / monitoring","rollupMethod": "manual","contributors": [],"flag": null,"note": "Target 1440 minutes (24 hrs). Registry shows 'P4 2880→1440' indicating target was recently tightened.","series": [2880,2000,1800,1600,1440,1440,1440,1440]}],"gaps": ["Sprint Burndown and Azure DevOps Points sub-KPIs: illustrative — exact actuals not in registry.","Ticket closure actuals for P1/P2/P4: registry shows targets only; P3 actual of 200 min is real. P1/P2/P4 actuals marked as matching target.","Ticket closure P4: registry shows previous target 2880 min, new target 1440 min — series uses both for trend context."]},"data/kz-records.json": [{"item": 1,"kzNumber": "KZ-325","title": "Hilo Incorrecto","deptId": "operations","who": "M. Valdez","odgSupport": true,"start": "2026-01-05","steps": {"1": true,"2": true,"3": true,"4": true,"5": true,"6": true,"7": true,"8": true},"active": false,"closed": true},{"item": 2,"kzNumber": "KZ-326","title": "Improve the Overall Order Entry Capacity","deptId": "operations","who": "J. Franco","odgSupport": false,"start": null,"steps": {"1": true,"2": true,"3": true,"4": true,"5": true,"6": true,"7": true,"8": true},"active": false,"closed": true},{"item": 3,"kzNumber": "KZ-329","title": "Eliminate customer complaints NBI","deptId": "operations","who": "Ingrid/Hector","odgSupport": false,"start": "2026-01-21","steps": {"1": true,"2": true,"3": true,"4": true,"5": true,"6": true,"7": true,"8": true},"active": false,"closed": true},{"item": 4,"kzNumber": "KZ-330","title": "Undelivered Packages - Carriers","deptId": "operations","who": "Gabriela Lopez","odgSupport": false,"start": null,"steps": {"1": true,"2": true,"3": true,"4": true,"5": true,"6": true,"7": false,"8": false},"active": true,"closed": false},{"item": 5,"kzNumber": "KZ-331","title": "Incremento de PPLH en digitalización.","linkedKpiId": "pplh_mexico","deptId": "operations","who": "G. Velasco","odgSupport": false,"start": "2026-01-20","steps": {"1": true,"2": true,"3": true,"4": true,"5": true,"6": true,"7": true,"8": true},"active": false,"closed": true},{"item": 6,"kzNumber": "KZ-332","title": "Duty and Tariff Reduction","deptId": "operations","who": "Eugene Wang","odgSupport": false,"start": null,"steps": {"1": true,"2": true,"3": true,"4": true,"5": false,"6": false,"7": false,"8": false},"active": true,"closed": false},{"item": 7,"kzNumber": "KZ-333","title": "Customs Clearnce Ocean Leadtime","deptId": "operations","who": "Gabriela Lopez","odgSupport": false,"start": null,"steps": {"1": true,"2": true,"3": true,"4": true,"5": true,"6": true,"7": false,"8": false},"active": true,"closed": false},{"item": 8,"kzNumber": "KZ-334","title": "Pricing Descrepancies","deptId": "operations","who": "P. Fernandez","odgSupport": false,"start": null,"steps": {"1": true,"2": false,"3": false,"4": false,"5": false,"6": false,"7": false,"8": false},"active": true,"closed": false},{"item": 9,"kzNumber": "KZ-335","title": "Time it takes to get a physical sample.","deptId": "operations","who": "Nick Restrepo","odgSupport": false,"start": "2026-01-28","steps": {"1": true,"2": false,"3": false,"4": false,"5": false,"6": false,"7": false,"8": false},"active": true,"closed": false},{"item": 10,"kzNumber": "KZ-336","title": "Reduccion de PNC en muestras","deptId": "operations","who": "G. Velasco","odgSupport": false,"start": "2026-01-28","steps": {"1": true,"2": true,"3": true,"4": true,"5": true,"6": true,"7": true,"8": true},"active": false,"closed": true},{"item": 11,"kzNumber": "KZ-337","title": "Standardization de Shorts cuts","linkedKpiId": "otp_mexico","deptId": "operations","who": "G. Velasco","odgSupport": false,"start": "2026-02-17","steps": {"1": true,"2": true,"3": true,"4": true,"5": true,"6": true,"7": true,"8": true},"active": false,"closed": true},{"item": 12,"kzNumber": "KZ-339","title": "Credit and rebill","deptId": "operations","who": "A.Gonzalez","odgSupport": true,"start": "2026-02-19","steps": {"1": true,"2": true,"3": true,"4": true,"5": true,"6": true,"7": true,"8": true},"active": false,"closed": true},{"item": 13,"kzNumber": "KZ-341","title": "PP Increase PPLH","linkedKpiId": "pplh","deptId": "operations","who": "Ingrid Cruz","odgSupport": false,"start": null,"steps": {"1": true,"2": true,"3": true,"4": true,"5": true,"6": true,"7": false,"8": false},"active": true,"closed": false},{"item": 14,"kzNumber": "KZ-342","title": "FLEXSTYLE REMAKE EXTERNO","deptId": "operations","who": "B. Juarez","odgSupport": false,"start": "2026-01-20","steps": {"1": true,"2": true,"3": true,"4": true,"5": true,"6": true,"7": true,"8": true},"active": false,"closed": true,"content": {"header": {"sponsor": "G. Navarro","leader": "M. Escalera / B. Juarez","team": "L. Romero, E. Hernandez, J. Gonzalez","revDate": "2026-01-20","lang": "ES"},"step1": {"ultimateGoal": "Eliminar remakes externos por diferencia de tono (Eliminate external remakes due to tone difference)","standard": "0 remake externo por diferencia de tono (0 external remakes due to tone difference)","current": "8,323 piezas de remake externo ($13,551.00 USD)","gap": "8,323 PZ ($13,551.00 USD)"},"step2": {"note": "Breakdown section held visual content only.","prioritizedProblem": "7,900 PZ en remakes externos porque no coincide el tono de la muestra contra la producción enviada al ser igualado (7,900 pieces — sample tone does not match production after color matching)"},"step3": {"doWhat": "Eliminar 7,900 pzas por diferencia de tono","toWhat": "0 pzas enviadas al cliente por este defecto","byWhen": "2026-02-27"},"step4": {"whys": [{"n": 1,"text": "El color no coincide al momento de igualar la impresión para la producción","category": "Man"},{"n": 2,"text": "Porque la ficha y producción se imprimieron en diferentes equipos","category": "Method"},{"n": 3,"text": "Por la capacidad que tiene cada equipo","category": "Machine"},{"n": 4,"text": "(Material — not populated)","category": "Material"},{"n": 5,"text": "(Environment — not populated)","category": "Environment"}],"rootCause": "La impresión de la orden presentó variación de color porque fue impresa en dos equipos diferentes los cuales no tienen la misma calidad de color por la vida útil de los mismos (Color varied because the order was printed on two different plotters with different color capability due to their age).","altChains": [{"label": "Chain 2","whys": ["El color no coincide al momento de igualar la impresión para la producción","No se tiene un método que confirme con exactitud el Pantone solicitado para la igualación","Por el comportamiento de la impresión en los diferentes materiales usados"],"rootCause": "No se cuenta con instrumento de medición que nos ayude a corroborar el color aun cambiando el material."},{"label": "Chain 3","whys": ["Falta de coincidencia entre prueba impresa y guía Pantone","No se tiene un método que confirme con exactitud el Pantone solicitado en cada material","El color varía dependiendo la porosidad y color del vinil","Falta de equipo que mida la interferencia del color en el vinil"],"rootCause": "No se cuenta con instrumento de medición que nos ayude a corroborar el color aun cambiando el material."}]},"step5": {"countermeasures": [{"text": "TPM de plotters (plotter maintenance)","S": 2,"Q": 2,"C": 2,"T": 1,"Cu": 2,"Ef": 2,"OA": 2},{"text": "Mejorar iluminación del área","S": 2,"Q": 2,"C": 1,"T": 1,"Cu": 2,"Ef": 2,"OA": 2},{"text": "Mejorar ambiente/clima para funcionamiento de los plotter","S": 2,"Q": 2,"C": 1,"T": 1,"Cu": 2,"Ef": 2,"OA": 1},{"text": "Confirmación visual durante la impresión y cambio de equipo con la ficha liberada","S": 2,"Q": 2,"C": 2,"T": 2,"Cu": 2,"Ef": 2,"OA": 3},{"text": "Equipo de medición para confirmación de tonos al cambio de materiales","S": 2,"Q": 2,"C": 2,"T": 2,"Cu": 2,"Ef": 2,"OA": 2}]},"step6": {"actionRows": [{"no": 1,"plan": "Prueba de confirmación de tonos en los distintos materiales","startDate": "2026-01-29","dueDate": "2026-01-29","responsible": "L. Romero","status": "C"},{"no": 2,"plan": "Ajustes de color en caso de variación de tono con ayuda de los color chart CMYK","startDate": "2026-01-29","dueDate": "2026-01-29","responsible": "M. Escalera","status": "C"},{"no": 3,"plan": "Confirmación de color en cama con ayuda de las fichas de igualación","startDate": "2026-01-29","dueDate": "2026-01-29","responsible": "E. Hernandez","status": "C"},{"no": 4,"plan": "Pruebas de funcionalidad de espectrofotómetro","startDate": "2026-02-04","dueDate": "2026-02-06","responsible": "L. Romero","status": "C"},{"no": 5,"plan": "Solicitud de compra de espectrofotómetro","startDate": "2026-02-16","dueDate": "2026-02-20","responsible": "M. Escalera","status": "C"},{"no": 6,"plan": "Diseño con Pantones PMS liberados en cada equipo","startDate": "2026-02-27","dueDate": "2026-03-15","responsible": "B. Juarez","status": "C"},{"no": 7,"plan": "Resguardo de fichas durante 6 meses","startDate": "2026-03-02","dueDate": "2026-03-15","responsible": "L. Gonzalez","status": "C"}],"odgGate": {"status": "approved","reviewer": "Eric / Allison (ODG)","note": "All 7 actions completed (C); cleared through gate."}},"step7": {"kpi": "Calidad — remakes externos en FlexStyle por diferencia de tono","measurementStart": "8,323 PZ ($13,551)","measurementEnd": "0 target","newTarget": "0 PZ","narrative": "Chart-based result (bar chart embedded, not text-readable). All 7 countermeasures completed."},"step8": {"processDocuments": "Actualización de documento AC-FR-7.5-078","training": "Todos los operadores del proceso de matcheo (all match operators)","yokoten": "Se dará a conocer el cambio a todos los integrantes del equipo de FlexStyle, ambos turnos (both shifts informed)","sopLink": {"id": "operations-shortcode","title": "AC-FR-7.5-078 — FlexStyle Color Match Standard Work","writtenBack": true}}}},{"item": 15,"kzNumber": "KZ-343","title": "Undelivered Packages Jan 2026 - Carriers","deptId": "operations","who": "Gabriela Lopez","odgSupport": false,"start": null,"steps": {"1": true,"2": true,"3": true,"4": true,"5": true,"6": false,"7": false,"8": false},"active": true,"closed": false},{"item": 16,"kzNumber": "KZ-344","title": "REDUCE PNC PV+","deptId": "operations","who": "B. Juarez","odgSupport": false,"start": "2026-01-10","steps": {"1": true,"2": true,"3": true,"4": true,"5": true,"6": true,"7": true,"8": true},"active": false,"closed": true},{"item": 17,"kzNumber": "KZ-345","title": "Daily Deliveries and Receiving intake","deptId": "operations","who": "Ingrid Cruz","odgSupport": false,"start": "2026-02-03","steps": {"1": true,"2": true,"3": true,"4": true,"5": true,"6": false,"7": false,"8": false},"active": true,"closed": false},{"item": 18,"kzNumber": "KZ-345","title": "Reducing non-value added waste - Receiving","deptId": "operations","who": "Ingrid Cruz","odgSupport": false,"start": "2026-02-03","steps": {"1": true,"2": true,"3": true,"4": true,"5": true,"6": false,"7": false,"8": false},"active": true,"closed": false},{"item": 19,"kzNumber": "KZ-346","title": "Pricing Credit Memos Feb '26","linkedKpiId": "otp_mexico","deptId": "operations","who": "P. Fernandez","odgSupport": false,"start": null,"steps": {"1": true,"2": true,"3": true,"4": true,"5": true,"6": true,"7": false,"8": false},"active": true,"closed": false},{"item": 20,"kzNumber": "KZ-347","title": "Book orders","deptId": "operations","who": "G. Velasco","odgSupport": false,"start": "2026-02-18","steps": {"1": true,"2": true,"3": true,"4": true,"5": true,"6": false,"7": false,"8": false},"active": true,"closed": false},{"item": 21,"kzNumber": "KZ-348","title": "Estandarizacion en Shorts cuts para tajima","linkedKpiId": "otp_mexico","deptId": "operations","who": "G. Velasco","odgSupport": false,"start": "2026-02-18","steps": {"1": true,"2": true,"3": true,"4": true,"5": true,"6": false,"7": true,"8": true},"active": false,"closed": true},{"item": 22,"kzNumber": "KZ-349","title": "Logistics Issues Feb","deptId": "operations","who": "Gabriela Lopez","odgSupport": false,"start": null,"steps": {"1": true,"2": true,"3": false,"4": false,"5": false,"6": false,"7": false,"8": false},"active": true,"closed": false},{"item": 23,"kzNumber": "KZ-350","title": "Increase R-DE NUMBERS","deptId": "operations","who": "Myrissa Stone","odgSupport": false,"start": "2026-03-30","steps": {"1": true,"2": true,"3": true,"4": true,"5": true,"6": true,"7": true,"8": true},"active": false,"closed": true},{"item": 24,"kzNumber": "KZ-351","title": "Heros Pride Response Time","deptId": "operations","who": "J. Franco","odgSupport": false,"start": "2026-03-20","steps": {"1": true,"2": true,"3": true,"4": true,"5": true,"6": true,"7": false,"8": false},"active": true,"closed": false},{"item": 25,"kzNumber": "KZ-352","title": "Errores en muestras por tension en bobina","deptId": "operations","who": "G. Velasco","odgSupport": false,"start": "2026-03-02","steps": {"1": true,"2": true,"3": true,"4": true,"5": true,"6": false,"7": true,"8": true},"active": false,"closed": true,"content": {"header": {"sponsor": "Gibran Velasco","leader": "Ramon Panales","team": "R. Panales / G. Velasco / M. Vazquez / O. Garcia","revDate": "2026-02-09","lang": "ES"},"step1": {"ultimateGoal": "Asegurar que las piezas bordadas en Muestras cumplan con la calidad requerida (Ensure sample-area embroidered pieces meet required quality)","standard": "120 pzas en PNC al mes","current": "216 piezas de PNC en 30 días","gap": "96 piezas"},"step2": {"note": "Breakdown section held no text cells.","prioritizedProblem": "Reducción de los errores por hilo incorrecto en bordado (Reduce incorrect-thread embroidery errors)"},"step3": {"doWhat": "Eliminar X PNC por defectos B2 por tensión de bobina","toWhat": "0 piezas PNC","byWhen": "2026-02-25"},"step4": {"whys": [{"n": 1,"text": "Tenemos incremento en el error B2 el cual es mala tensión de bobina","category": "Man"},{"n": 2,"text": "La gente no sabe usar el tensionador correctamente","category": "Method"},{"n": 3,"text": "Nunca han recibido una capacitación","category": "Machine"},{"n": 4,"text": "No se tiene la información en el SW sobre cómo es el procedimiento completo de tensionado de bobina","category": "Material"},{"n": 5,"text": "El SW no está actualizado","category": "Environment"}],"rootCause": "SW no está actualizado con la capacitación pertinente con respecto al tensionado de bobina (Standard Work not updated with the relevant bobbin-tensioning training)."},"step5": {"countermeasures": [{"text": "Actualizar el SW de la operación para que todos tengan tensionador","S": 2,"Q": 2,"C": 2,"T": 1,"Cu": 2,"Ef": 2,"OA": null},{"text": "Capacitación en el proceso con el personal de experiencia","S": 2,"Q": 2,"C": 2,"T": 1,"Cu": 2,"Ef": 2,"OA": null},{"text": "Información sobre niveles de tensión","S": 2,"Q": 1,"C": 2,"T": 0,"Cu": 2,"Ef": 2,"OA": null},{"text": "Contar con la herramienta completa para el proceso","S": 2,"Q": 2,"C": 1,"T": 0,"Cu": 2,"Ef": 2,"OA": null},{"text": "Ayuda visual de los parámetros","S": 2,"Q": 2,"C": 2,"T": 0,"Cu": 0,"Ef": 2,"OA": null},{"text": "Estandarizar el tipo de bobina","S": 2,"Q": 2,"C": 2,"T": 0,"Cu": 0,"Ef": 2,"OA": null}]},"step6": {"actionRows": [{"no": 1,"plan": "Actualizar SW sobre la tensión de bobina","startDate": "2026-02-09","dueDate": "2026-02-13","responsible": "M. Vazquez","status": "C"},{"no": 2,"plan": "Realizar capacitación de tensión de bobina","startDate": "2026-02-16","dueDate": "2026-02-16","responsible": "M. Vazquez","status": "C"},{"no": 3,"plan": "Realizar ayuda visual sobre los parámetros de tensión de bobina","startDate": "2026-02-18","dueDate": "2026-02-20","responsible": "R. Panales","status": "C"},{"no": 4,"plan": "Rectificar que las operarias que lo necesiten cuenten con tensionadores","startDate": "2026-02-23","dueDate": "2026-02-25","responsible": "M. Vazquez","status": "C"}],"odgGate": {"status": "approved","reviewer": "Eric / Allison (ODG)","note": "All 4 actions completed (C) by Feb 25."}},"step7": {"kpi": "Quality (PNC — Muestras)","measurementStart": "216 PNC / 30 días","measurementEnd": "0 target","newTarget": "0 piezas PNC","narrative": "Se detectó un alto número de PNC por error de tensión de bobina en los últimos 30 días, ocasionado por la falta de actualización en el SW y la falta de capacitación. En el SW se indica el método para tensionar el hilo de la bobina y se capacita al personal involucrado."},"step8": {"processDocuments": "SWI de bordado de Muestras","training": "Alicia Floriano — team member — 16-FEB","yokoten": "(not populated in source)","sopLink": {"id": "operations-shortcode","title": "SWI — Bordado de Muestras (Bobbin Tension)","writtenBack": true}}}},{"item": 26,"kzNumber": "KZ-352","title": "Textos sucios en el bordado","deptId": "operations","who": "G. Velasco","odgSupport": false,"start": "2026-04-02","steps": {"1": true,"2": true,"3": true,"4": true,"5": true,"6": true,"7": false,"8": false},"active": true,"closed": false},{"item": 27,"kzNumber": "KZ-353","title": "Eliminate remakes by incorrect product in container.","deptId": "operations","who": "Magnolia Isaac","odgSupport": false,"start": "2026-03-27","steps": {"1": true,"2": true,"3": true,"4": true,"5": true,"6": true,"7": true,"8": true},"active": false,"closed": true},{"item": 28,"kzNumber": "KZ-354","title": "REMAKE ANTIGUA Piezas amarillas","deptId": "operations","who": "J. Morán","odgSupport": false,"start": "2026-02-16","steps": {"1": true,"2": true,"3": true,"4": true,"5": true,"6": false,"7": false,"8": false},"active": true,"closed": false},{"item": 29,"kzNumber": "KZ-355","title": "Reduce rework at Applications area.","deptId": "operations","who": "Myrissa Stone","odgSupport": false,"start": "2026-04-10","steps": {"1": true,"2": true,"3": true,"4": true,"5": true,"6": true,"7": true,"8": true},"active": false,"closed": true},{"item": 30,"kzNumber": "KZ-359","title": "Shipment not delivered","deptId": "operations","who": "E. Wang","odgSupport": false,"start": null,"steps": {"1": true,"2": true,"3": true,"4": true,"5": true,"6": false,"7": false,"8": false},"active": true,"closed": false},{"item": 1,"kzNumber": "KZ-327","title": "AR Billing","deptId": "finance","who": "P. Fernandez","odgSupport": true,"start": null,"steps": {"1": true,"2": true,"3": true,"4": true,"5": true,"6": true,"7": true,"8": true},"active": false,"closed": true,"content": {"header": {"sponsor": "J. Kozel","leader": "P. Fernandez / Arturo Gonzalez","team": "(not listed)","revDate": null,"lang": "EN"},"step1": {"ultimateGoal": "Ensure proper billing to achieve customer satisfaction and trust","standard": "$0 USD worth of discrepancies","current": "$43K USD in December","gap": "$43K USD"},"step2": {"note": "Breakdown section held a Pareto chart (embedded graphic, not text-readable).","prioritizedProblem": "$22,225.41 manual price change in the System"},"step3": {"doWhat": "Eliminate $22,225.41 manual price change","toWhat": "$0","byWhen": "2026-01-31"},"step4": {"whys": [{"n": 1,"text": "Manual price change","category": "Man"},{"n": 2,"text": "Special/custom made products","category": "Method"},{"n": 3,"text": "These items are not in Episerver","category": "Machine"},{"n": 4,"text": "Our systems do not change prices automatically for these items","category": "Material"},{"n": 5,"text": "(Environment — not populated)","category": "Environment"}],"rootCause": "Not automated pricing update in BC and Episerver / No custom-made items to put in the system"},"step5": {"countermeasures": [{"text": "Add special items in Episerver","S": 2,"Q": 2,"C": 1,"T": 1,"Cu": 2,"Ef": 2,"OA": 1},{"text": "Set price in Episerver for these items","S": 2,"Q": 2,"C": 2,"T": 2,"Cu": 2,"Ef": 2,"OA": 2},{"text": "Create system to set custom item prices automatically in BC and Epi","S": 2,"Q": 2,"C": 2,"T": 2,"Cu": 2,"Ef": 2,"OA": null},{"text": "Keep a shared Excel record between Sales and Pricing","S": 2,"Q": 2,"C": 2,"T": 1,"Cu": 2,"Ef": 2,"OA": 2},{"text": "Improve communication between Sales and Pricing (Teams channel, approval flow)","S": 2,"Q": 2,"C": 2,"T": 2,"Cu": 2,"Ef": 2,"OA": 2}]},"step6": {"actionRows": [{"no": 1,"plan": "Sales to provide correct pricing to Pricing Dept.","startDate": "2025-12-22","dueDate": "2025-12-22","responsible": "M. Urrow","status": "C"},{"no": 2,"plan": "Pricing Dept. to set correct pricing in BC","startDate": "2025-12-22","dueDate": "2025-12-22","responsible": "P. Fernandez","status": "C"},{"no": 3,"plan": "Keep tracking for new orders (Cus. Service)","startDate": "2025-12-23","dueDate": "2026-01-16","responsible": "J. Jara","status": "C"},{"no": 4,"plan": "Request IT to add automated special items in the System","startDate": "2025-12-11","dueDate": "2025-12-11","responsible": "J. Kozel","status": "C"},{"no": 5,"plan": "Create flow chart","startDate": "2026-01-28","dueDate": "2026-01-29","responsible": "P. Fernandez","status": "C"},{"no": 6,"plan": "Create BWI","startDate": "2026-01-29","dueDate": "2026-01-30","responsible": "P. Fernandez","status": "C"},{"no": 7,"plan": "Train Pricing team and Customer Service","startDate": "2026-02-02","dueDate": "2026-02-04","responsible": "P. Fernandez","status": "C"}],"odgGate": {"status": "approved","reviewer": "Eric / Allison (ODG)","note": "ODG-supported item — approved for implementation."}},"step7": {"kpi": "Cost","measurementStart": "$43K (Dec)","measurementEnd": "$0 (Feb 5–16)","newTarget": "$0","narrative": "Since Feb 5th until Feb 16th, $0 in billing issues related to this problem-solving."},"step8": {"processDocuments": "BWI — Edit information from an Open Order in BC","training": "Paulina Fernandez trained Jessica Jara and CS team (Feb 2–4)","yokoten": "Pricing and Freight Team and Customer Service notified","sopLink": {"id": "operations-shortcode","title": "BWI — Edit information from an Open Order in BC","writtenBack": true}}}},{"item": 2,"kzNumber": "KZ-339","title": "Credit and rebill","deptId": "finance","who": "A. Gonzalez","odgSupport": false,"start": null,"steps": {"1": true,"2": true,"3": true,"4": true,"5": true,"6": true,"7": true,"8": true},"active": false,"closed": true},{"item": 3,"kzNumber": "KZ-340","title": "AR 8 step","deptId": "finance","who": "J. Kozel","odgSupport": true,"start": null,"steps": {"1": true,"2": false,"3": false,"4": false,"5": false,"6": false,"7": false,"8": false},"active": true,"closed": false},{"item": 1,"kzNumber": "KZ-328","title": "Sales Approval","deptId": "sales","who": "T. Morando","odgSupport": false,"start": null,"steps": {"1": true,"2": true,"3": true,"4": true,"5": true,"6": false,"7": false,"8": false},"active": true,"closed": false,"content": {"header": {"sponsor": "Tony Morando","leader": "Tony Morando","team": "Commercialization","revDate": null,"lang": "EN"},"step1": {"ultimateGoal": "Improve the delivery system that eliminates preventable credits","standard": "Every order flows right-first-time from validated customer requirements through delivery, resulting in $0 preventable credits","current": "Preventable order entry and account setup errors, resulting in $95,162.75 credits for December","gap": "$95,162.75"},"step2": {"note": "Breakdown section held visual content (no text cells).","prioritizedProblem": "$94,086.48 in defined pricing approval process"},"step3": {"doWhat": "Eliminate $94,086.48 in credits","toWhat": "$0.0","byWhen": "2026-02-20"},"step4": {"whys": [{"n": 1,"text": "The new account was not setup correctly","category": "Man"},{"n": 2,"text": "Special pricing and freight deals were not communicated","category": "Method"},{"n": 3,"text": "The approval process was not submitted in CRM","category": "Machine"},{"n": 4,"text": "The sales rep doesn't have a clear process when not dealing with the standard price list","category": "Material"},{"n": 5,"text": "(Environment — not populated)","category": "Environment"}],"rootCause": "There are no checks and balances when setting up a new account with no standard prices or terms."},"step5": {"countermeasures": [{"text": "Standardize and strengthen customer onboarding standard work","S": 2,"Q": 2,"C": 2,"T": 1,"Cu": 2,"Ef": 2,"OA": 2},{"text": "Implement ERP validation rules to prevent errors in real time","S": 2,"Q": 2,"C": 0,"T": 1,"Cu": 2,"Ef": 2,"OA": 1},{"text": "Establish a weekly cross-functional review for new account creation","S": 2,"Q": 2,"C": 2,"T": 1,"Cu": 2,"Ef": 2,"OA": null},{"text": "Implement dual verification for high-risk orders and high-volume customers","S": 2,"Q": 2,"C": 1,"T": 1,"Cu": 2,"Ef": 2,"OA": 2}]},"step6": {"actionRows": [{"no": 1,"plan": "Implement a weekly cross-functional onboarding call","startDate": "2026-02-06","dueDate": "2026-02-27","responsible": "Tony Morando","status": "R"},{"no": 2,"plan": "Implement a standardized new customer onboarding checklist","startDate": "2026-02-02","dueDate": "2026-02-03","responsible": "Tony Morando","status": "R"},{"no": 3,"plan": "Log all new account onboarding checklists under corresponding account in CRM","startDate": "2026-02-03","dueDate": "2026-02-04","responsible": "Tony Morando","status": "R"}],"odgGate": {"status": "pending","reviewer": "Eric / Allison (ODG)","note": "Actions still R-status (behind). Not yet cleared through ODG gate."}},"step7": {"kpi": "Quality — Remakes / Credits","measurementStart": "$95,162.75 (Dec)","measurementEnd": "(in progress)","newTarget": "$0","narrative": "Decrease credits to $0 generated by setting up new accounts."},"step8": {"processDocuments": "(pending — onboarding checklist + CRM logging SW to be published on close)","training": "(pending)","yokoten": "(pending)","sopLink": {"id": "service-prospecting","title": "World Emblem New Customer Account Setup","writtenBack": false}}}},{"item": 31,"kzNumber": "KZ-364","title": "Reduce Rework at Applications Area — Richardson","deptId": "operations","who": "Myrissa Stone","odgSupport": true,"start": "2026-04-13","steps": {"1": true,"2": true,"3": true,"4": true,"5": true,"6": true,"7": true,"8": true},"active": false,"closed": true,"content": {"header": {"sponsor": "Hector Rodriguez","leader": "Myrissa Stone / Michelle Finol","team": "Myrissa Stone, Michelle Finol, Vanessa Perez","revDate": "2026-05-01","lang": "EN"},"step1": {"ultimateGoal": "Reduce rework on Richardson Applications area","standard": "0 Rework","current": "72 Rework (during one week)","gap": "72 (during one week)"},"step2": {"note": "Breakdown section held no text cells.","prioritizedProblem": "Patches that do not require heat move because the adhesive is not strong enough."},"step3": {"doWhat": "Eliminate caps reworked by off-center issues","toWhat": "0 rework","byWhen": "2026-04-17"},"step4": {"whys": [{"n": 1,"text": "We had a lot of rework","category": "Man"},{"n": 2,"text": "Quality issues","category": "Method"},{"n": 3,"text": "Patches off center","category": "Machine"},{"n": 4,"text": "The patch's adhesive doesn't stick to the hats","category": "Material"},{"n": 5,"text": "If heat is not applied, they move during the process","category": "Environment"}],"rootCause": "If heat is not applied, the patches move during the process."},"step5": {"countermeasures": [{"text": "Buy additional glue to apply to the patches","S": 2,"Q": 2,"C": 0,"T": 1,"Cu": 2,"Ef": 2,"OA": 2},{"text": "Use 3M double tape","S": 2,"Q": 2,"C": 0,"T": 1,"Cu": 2,"Ef": 2,"OA": 2},{"text": "Do nothing","S": 2,"Q": 0,"C": 0,"T": 0,"Cu": 0,"Ef": 0,"OA": 2},{"text": "Apply heat to all orders regardless of whether the order requests it or not","S": 2,"Q": 1,"C": 2,"T": 1,"Cu": 2,"Ef": 2,"OA": 2}]},"step6": {"actionRows": [{"no": 1,"plan": "Change the process","startDate": "2026-04-13","dueDate": "2026-04-13","responsible": "Vanessa Perez","status": "C"},{"no": 2,"plan": "Train the staff","startDate": "2026-04-13","dueDate": "2026-04-13","responsible": "Vanessa Perez","status": "C"},{"no": 3,"plan": "Update the Standard Work","startDate": "2026-04-14","dueDate": "2026-04-14","responsible": "Michelle Finol","status": "C"}],"odgGate": {"status": "approved","reviewer": "Eric / Allison (ODG)","note": "All 3 actions completed (C) by Apr 14."}},"step7": {"kpi": "Quality","measurementStart": "72 rework / week","measurementEnd": "0 target","newTarget": "0 rework","narrative": "During the process to complete this 8-step we identified that the main reason was that a big portion of daily orders don’t request heat-transfer application, so the patch moves off-center before sewing. Countermeasure: apply heat transfer to ALL orders regardless of whether the order requests it. Instructions: Top-side machine 344°F, down-side machine 282°F, 5 seconds."},"step8": {"processDocuments": "The Standard Work instruction is already updated","training": "Vanessa Perez — 04/13/2026 — 10:00 a.m. to 10:40 a.m.","yokoten": "This process needs to be applied only for Richardson applications use.","sopLink": {"id": "operations-shortcode","title": "SW — Richardson Applications Heat-Transfer (344°F / 282°F / 5s)","writtenBack": true}}}}],"data/logistics.json": {"id": "logistics","name": "Logistics","lead": null,"tier": 2,"mechanism": "sum","rollupMethod": "sum","note": "100% manual weekly entry. Actuals entered directly into FMDS Logistic workbook cells. 4 locations: WE (×4 loc avg 0.52 shipping margin).","kpis": [{"id": "immex_vat","name": "IMMEX / VAT Compliance","level": 1,"isMain": true,"parentId": null,"target": 1.0,"actual": 1.0,"unit": "ratio","direction": "higher_better","source": "Manual","targetSource": "Carrier / Customs portal","rollupMethod": "manual","contributors": [],"flag": null,"series": [1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0]},{"id": "on_time_inbound","name": "On-Time Inbound","level": 1,"isMain": true,"parentId": null,"target": null,"actual": null,"nodata": true,"nodataNote": "On-Time Inbound not yet captured with an explicit target on the current board.","unit": "ratio","direction": "higher_better","source": "Manual","targetSource": "Carrier / Customs portal","rollupMethod": "manual","contributors": [],"flag": null,"series": []},{"id": "on_time_outbound","name": "On-Time Outbound","level": 1,"isMain": true,"parentId": null,"target": null,"actual": null,"nodata": true,"nodataNote": "On-Time Outbound not yet captured with an explicit target on the current board.","unit": "ratio","direction": "higher_better","source": "Manual","targetSource": "Carrier / Customs portal","rollupMethod": "manual","contributors": [],"flag": null,"series": []},{"id": "claims_ratio","name": "Claims Ratio","level": 1,"isMain": true,"parentId": null,"target": null,"actual": null,"nodata": true,"nodataNote": "Claims Ratio target not explicitly defined on current board. Pending discovery.","unit": "ratio","direction": "lower_better","source": "Manual","targetSource": "Carrier / Customs portal","rollupMethod": "manual","contributors": [],"flag": null,"series": []},{"id": "we_shipping_margin","name": "WE Avg Shipping Margin","level": 1,"isMain": true,"parentId": null,"target": 0.52,"actual": 0.52,"unit": "ratio","direction": "higher_better","source": "Manual","targetSource": "Business Central","rollupMethod": "sum","contributors": ["shipping_margin_loc1","shipping_margin_loc2","shipping_margin_loc3","shipping_margin_loc4"],"flag": null,"note": "Average across 4 locations — quarterly step target 0.53 → 0.568.","series": [0.52,0.52,0.52,0.52,0.52,0.52,0.52,0.52]},{"id": "shipping_margin_loc1","name": "Shipping Margin — Loc 1","level": 2,"isMain": false,"parentId": "we_shipping_margin","target": 0.52,"actual": 0.52,"unit": "ratio","direction": "higher_better","source": "Manual","targetSource": "Business Central","rollupMethod": null,"contributors": [],"flag": null,"illustrative": true,"series": [0.52]},{"id": "shipping_margin_loc2","name": "Shipping Margin — Loc 2","level": 2,"isMain": false,"parentId": "we_shipping_margin","target": 0.52,"actual": 0.52,"unit": "ratio","direction": "higher_better","source": "Manual","targetSource": "Business Central","rollupMethod": null,"contributors": [],"flag": null,"illustrative": true,"series": [0.52]},{"id": "shipping_margin_loc3","name": "Shipping Margin — Loc 3","level": 2,"isMain": false,"parentId": "we_shipping_margin","target": 0.52,"actual": 0.52,"unit": "ratio","direction": "higher_better","source": "Manual","targetSource": "Business Central","rollupMethod": null,"contributors": [],"flag": null,"illustrative": true,"series": [0.52]},{"id": "shipping_margin_loc4","name": "Shipping Margin — Loc 4","level": 2,"isMain": false,"parentId": "we_shipping_margin","target": 0.52,"actual": 0.52,"unit": "ratio","direction": "higher_better","source": "Manual","targetSource": "Business Central","rollupMethod": null,"contributors": [],"flag": null,"illustrative": true,"series": [0.52]},{"id": "hp_shipping_margin","name": "HP Shipping Margin","level": 1,"isMain": true,"parentId": null,"target": null,"actual": 0.031,"unit": "ratio","direction": "higher_better","source": "Manual","targetSource": "Business Central","rollupMethod": "manual","contributors": [],"flag": null,"note": "Target not formally set on current board.","series": [0.031]},{"id": "srr","name": "SRR (Standard Rate Review)","level": 1,"isMain": true,"parentId": null,"target": 0.8,"actual": 0.8,"unit": "ratio","direction": "higher_better","source": "ODG","targetSource": "ODG","rollupMethod": "manual","contributors": [],"flag": null,"series": [0.8]},{"id": "safety_incident","name": "Safety Incident Rate (TRIR)","level": 1,"isMain": true,"parentId": null,"target": 0,"actual": 0,"unit": "rate","direction": "lower_better","source": "Manual","targetSource": "Manual — reported","manualOnly": true,"rollupMethod": "manual","contributors": [],"flag": null,"note": "Target 0 — zero-incident safety goal. 0 actual = green.","series": [0,0,0,0,0,0,0,0]},{"id": "dart","name": "DART Rate","level": 1,"isMain": true,"parentId": null,"target": 0,"actual": 0,"unit": "rate","direction": "lower_better","source": "Manual","targetSource": "Manual — reported","manualOnly": true,"rollupMethod": "manual","contributors": [],"flag": null,"note": "Target 0 — zero-incident safety goal. 0 actual = green.","series": [0,0,0,0,0,0,0,0]}],"gaps": ["On-Time Inbound / Outbound: no explicit target found in registry — marked nodata.","Claims Ratio: no explicit target found in registry — marked nodata.","Per-location breakdown for shipping margin: location names not specified in registry — sub-rows marked illustrative.","HP Shipping Margin: target not formally set on board."]},"data/marketing.json": {"id": "marketing","name": "Marketing","lead": "Carlos Mitchell","tier": 2,"mechanism": "sum","rollupMethod": "external","rollupNote": "Marketing actuals arrive via external links from Rhythm (WEI Total Leads Revenue / WE Revenue Incoming), Ecomm-Carlos (# Leads), and Branding Search Console. Rollup is manual until those feeds are live.","agentNote": "Carlos's Hermes agent can wrap this board — the agent layer is intentionally left open so Hermes can integrate as the automation layer for Marketing.","l2Boards": [{"boardId": "branding_creative_pc","file": "FMDS - Group  Branding & Creative 2026- PC.xlsx","ownerCode": "PC","ownerName": "PC (full name unconfirmed)","domain": "Branding, organic visibility, social media, PR, agency accountability","cadence": "weekly","divisions": ["WEI","CG","HPI"],"actualsStatus": "active — weekly actuals populated through Wk 26 (Jun 27 2026)","sheets": ["WEI Database PC","CG Database PC","HPI Database PC","Data Base PC","DASHBOARD PC","Agency's Path"]},{"boardId": "ecomm_perf_mktg_cm","file": "FMDS - Group Ecomm & Performance Marketing 2026- CM.xlsx","ownerCode": "CM","ownerName": "Carlos Mitchell","domain": "Ecommerce revenue by channel, paid performance (META/LinkedIn/Google), demand generation / leads pipeline","cadence": "weekly","divisions": ["WEI","CG","HPI"],"actualsStatus": "sparse — revenue targets set, no revenue actuals entered; one week of MQL lead data (Wk 9 Feb 28). Revenue actuals flow from Rhythm 2025 external workbook, not entered here.","sheets": ["WEI Database CM","CG Database CM","HPI Database CM","Data Base CM","DASHBOARD CM","GRAF"]}],"kpis": [{"id": "wei_leads_revenue","name": "WEI Total Leads Revenue","level": 1,"isMain": true,"parentId": null,"owner": "CM","ownerName": "Carlos Mitchell","boardId": "ecomm_perf_mktg_cm","section": "DEMAND GENERATION","target": null,"actual": null,"nodata": true,"nodataNote": "Sourced from Rhythm (external workbook). Target not entered in CM board. Actuals flow from Rhythm 2025 via CEO dashboard.","unit": "$/week","direction": "higher_better","source": "Rhythm 2025","targetSource": "Rhythm 2025","rollupMethod": "external","contributors": ["mkt_sourced_revenue_wei"],"flag": null,"series": [],"illustrative": false},{"id": "we_revenue_incoming","name": "WE Revenue Incoming","level": 1,"isMain": true,"parentId": null,"owner": "CM","ownerName": "Carlos Mitchell","boardId": "ecomm_perf_mktg_cm","section": "ECOMMERCE","target": null,"actual": null,"nodata": true,"nodataNote": "= Custom Genie + HPI revenue combined. Sourced from external links (Ecomm-CM and DxD HPI). Target not defined on board.","unit": "$/mo","direction": "higher_better","source": "Custom Genie / HPI","targetSource": "Ecomm platform","rollupMethod": "external","contributors": ["we_rev_custom_genie","we_rev_hpi"],"flag": null,"series": [],"illustrative": false},{"id": "we_rev_custom_genie","name": "WE Rev — Custom Genie","level": 2,"isMain": false,"parentId": "we_revenue_incoming","owner": "CM","ownerName": "Carlos Mitchell","boardId": "ecomm_perf_mktg_cm","section": "ECOMMERCE","target": null,"actual": null,"nodata": true,"nodataNote": "Pending Ecomm-CM external link.","unit": "$/mo","direction": "higher_better","source": "Ecomm-CM","targetSource": "Ecomm platform","rollupMethod": null,"contributors": [],"flag": null,"series": []},{"id": "we_rev_hpi","name": "WE Rev — HPI","level": 2,"isMain": false,"parentId": "we_revenue_incoming","owner": "CM","ownerName": "Carlos Mitchell","boardId": "ecomm_perf_mktg_cm","section": "ECOMMERCE","target": null,"actual": null,"nodata": true,"nodataNote": "Pending DxD HPI external link.","unit": "$/mo","direction": "higher_better","source": "DxD HPI","targetSource": "DxD HPI","rollupMethod": null,"contributors": [],"flag": null,"series": []},{"id": "revenue_wei_total","name": "Revenue WEI (Total Ecommerce)","level": 1,"isMain": true,"parentId": null,"owner": "CM","ownerName": "Carlos Mitchell","boardId": "ecomm_perf_mktg_cm","section": "ECOMMERCE","target": 2700000,"actual": null,"nodata": false,"nodataNote": "Target set in CM board ($2.7M/week WEI). No actuals entered — revenue flows from Rhythm 2025.","unit": "$/week","direction": "higher_better","source": "CM Board (target); Rhythm 2025 (actuals)","targetSource": "Rhythm 2025 / Ecomm platform","rollupMethod": "external","contributors": ["revenue_website_b2b","revenue_website_b2c","revenue_amazon","revenue_walmart"],"flag": "actuals_missing","series": [],"illustrative": false},{"id": "revenue_website_b2b","name": "Revenue Website B2B","level": 2,"isMain": false,"parentId": "revenue_wei_total","owner": "CM","ownerName": "Carlos Mitchell","boardId": "ecomm_perf_mktg_cm","section": "ECOMMERCE","target": null,"actual": null,"nodata": true,"nodataNote": "Target column present, no value entered. Actuals: none entered.","unit": "$/week","direction": "higher_better","source": "Ecomm platform","targetSource": "Rhythm 2025 / Ecomm platform","series": []},{"id": "revenue_website_b2c","name": "Revenue Website B2C","level": 2,"isMain": false,"parentId": "revenue_wei_total","owner": "CM","ownerName": "Carlos Mitchell","boardId": "ecomm_perf_mktg_cm","section": "ECOMMERCE","target": null,"actual": null,"nodata": true,"nodataNote": "Target column present, no value entered.","unit": "$/week","direction": "higher_better","source": "Ecomm platform","targetSource": "Rhythm 2025 / Ecomm platform","series": []},{"id": "revenue_amazon","name": "Revenue Amazon","level": 2,"isMain": false,"parentId": "revenue_wei_total","owner": "CM","ownerName": "Carlos Mitchell","boardId": "ecomm_perf_mktg_cm","section": "ECOMMERCE","target": null,"actual": null,"nodata": true,"unit": "$/week","direction": "higher_better","source": "Amazon Seller Central","targetSource": "Amazon Seller Central","series": []},{"id": "revenue_walmart","name": "Revenue Walmart","level": 2,"isMain": false,"parentId": "revenue_wei_total","owner": "CM","ownerName": "Carlos Mitchell","boardId": "ecomm_perf_mktg_cm","section": "ECOMMERCE","target": null,"actual": null,"nodata": true,"unit": "$/week","direction": "higher_better","source": "Walmart Marketplace","targetSource": "Walmart Marketplace","series": []},{"id": "cvr_wei","name": "WEI Conversion Rate (CVR)","level": 1,"isMain": true,"parentId": null,"owner": "CM","ownerName": "Carlos Mitchell","boardId": "ecomm_perf_mktg_cm","section": "ECOMMERCE","target": null,"actual": null,"nodata": true,"nodataNote": "Column present, no target entered. Net-new feed needed (GA4 / ecomm platform).","unit": "%","direction": "higher_better","source": "GA4 / Ecomm platform","targetSource": "GA4 / Ecomm platform","contributors": ["cvr_b2b","cvr_b2c","cvr_amazon","cvr_walmart"],"series": []},{"id": "aov_wei","name": "WEI Average Order Value","level": 1,"isMain": true,"parentId": null,"owner": "CM","ownerName": "Carlos Mitchell","boardId": "ecomm_perf_mktg_cm","section": "ECOMMERCE","target": null,"actual": null,"nodata": true,"nodataNote": "Column present, no target entered. Net-new feed needed.","unit": "$/order","direction": "higher_better","source": "Ecomm platform / NetSuite","targetSource": "Ecomm platform / NetSuite","contributors": ["aov_b2b","aov_b2c","aov_amazon","aov_walmart"],"series": []},{"id": "repeat_purchase_wei","name": "WEI Repeat Purchase Rate","level": 1,"isMain": true,"parentId": null,"owner": "CM","ownerName": "Carlos Mitchell","boardId": "ecomm_perf_mktg_cm","section": "ECOMMERCE","target": null,"actual": null,"nodata": true,"nodataNote": "Column present, no target entered.","unit": "%","direction": "higher_better","source": "Ecomm platform / CRM","targetSource": "Ecomm platform / CRM","contributors": ["repeat_b2b","repeat_b2c","repeat_amazon","repeat_walmart"],"series": []},{"id": "cart_abandonment_wei","name": "WEI Cart Abandonment Rate","level": 1,"isMain": true,"parentId": null,"owner": "CM","ownerName": "Carlos Mitchell","boardId": "ecomm_perf_mktg_cm","section": "ECOMMERCE","target": null,"actual": null,"nodata": true,"nodataNote": "Column present, no target entered.","unit": "%","direction": "lower_better","source": "Ecomm platform / GA4","targetSource": "GA4 / Ecomm platform","contributors": ["cart_abandon_b2b","cart_abandon_b2c","cart_abandon_amazon","cart_abandon_walmart"],"series": []},{"id": "meta_revenue_wei","name": "WEI META Revenue","level": 1,"isMain": true,"parentId": null,"owner": "CM","ownerName": "Carlos Mitchell","boardId": "ecomm_perf_mktg_cm","section": "PERFORMANCE MARKETING","target": 200000,"actual": null,"nodata": false,"nodataNote": "Target $200K/week. No actuals entered in this book.","unit": "$/week","direction": "higher_better","source": "Meta Ads Manager","contributors": ["meta_cac_wei","meta_roas_wei"],"flag": "actuals_missing","series": [],"targetSource": "Meta Ads Manager"},{"id": "meta_cac_wei","name": "META Customer Acquisition Cost (CAC)","level": 2,"isMain": false,"parentId": "meta_revenue_wei","owner": "CM","ownerName": "Carlos Mitchell","boardId": "ecomm_perf_mktg_cm","section": "PERFORMANCE MARKETING","target": 120,"actual": null,"nodata": false,"nodataNote": "Target $120 CAC. No actuals entered.","unit": "$/customer","direction": "lower_better","source": "Meta Ads Manager","series": [],"targetSource": "Meta Ads Manager"},{"id": "meta_roas_wei","name": "META Revenue on Ad Spend (ROAS)","level": 2,"isMain": false,"parentId": "meta_revenue_wei","owner": "CM","ownerName": "Carlos Mitchell","boardId": "ecomm_perf_mktg_cm","section": "PERFORMANCE MARKETING","target": 4,"actual": null,"nodata": false,"nodataNote": "Target ROAS = 4. No actuals entered.","unit": "ratio","direction": "higher_better","source": "Meta Ads Manager","series": [],"targetSource": "Meta Ads Manager"},{"id": "linkedin_revenue_wei","name": "WEI LinkedIn Revenue","level": 1,"isMain": true,"parentId": null,"owner": "CM","ownerName": "Carlos Mitchell","boardId": "ecomm_perf_mktg_cm","section": "PERFORMANCE MARKETING","target": 100000,"actual": null,"nodata": false,"nodataNote": "Target $100K/week. No actuals entered.","unit": "$/week","direction": "higher_better","source": "LinkedIn Campaign Manager","contributors": ["linkedin_cac_wei","linkedin_roas_wei"],"flag": "actuals_missing","series": [],"targetSource": "LinkedIn Campaign Manager"},{"id": "linkedin_cac_wei","name": "LinkedIn Customer Acquisition Cost (CAC)","level": 2,"isMain": false,"parentId": "linkedin_revenue_wei","owner": "CM","ownerName": "Carlos Mitchell","boardId": "ecomm_perf_mktg_cm","section": "PERFORMANCE MARKETING","target": 250,"actual": null,"unit": "$/customer","direction": "lower_better","source": "LinkedIn Campaign Manager","series": [],"targetSource": "LinkedIn Campaign Manager"},{"id": "linkedin_roas_wei","name": "LinkedIn Revenue on Ad Spend (ROAS)","level": 2,"isMain": false,"parentId": "linkedin_revenue_wei","owner": "CM","ownerName": "Carlos Mitchell","boardId": "ecomm_perf_mktg_cm","section": "PERFORMANCE MARKETING","target": 3.5,"actual": null,"unit": "ratio","direction": "higher_better","source": "LinkedIn Campaign Manager","series": [],"targetSource": "LinkedIn Campaign Manager"},{"id": "google_revenue_wei","name": "WEI Google Revenue","level": 1,"isMain": true,"parentId": null,"owner": "CM","ownerName": "Carlos Mitchell","boardId": "ecomm_perf_mktg_cm","section": "PERFORMANCE MARKETING","target": 150000,"actual": null,"nodata": false,"nodataNote": "Target $150K/week. No actuals entered.","unit": "$/week","direction": "higher_better","source": "Google Ads","contributors": ["google_cac_wei","google_roas_wei"],"flag": "actuals_missing","series": [],"targetSource": "Google Ads"},{"id": "google_cac_wei","name": "Google Customer Acquisition Cost (CAC)","level": 2,"isMain": false,"parentId": "google_revenue_wei","owner": "CM","ownerName": "Carlos Mitchell","boardId": "ecomm_perf_mktg_cm","section": "PERFORMANCE MARKETING","target": 250,"actual": null,"unit": "$/customer","direction": "lower_better","source": "Google Ads","series": [],"targetSource": "Google Ads"},{"id": "google_roas_wei","name": "Google Revenue on Ad Spend (ROAS)","level": 2,"isMain": false,"parentId": "google_revenue_wei","owner": "CM","ownerName": "Carlos Mitchell","boardId": "ecomm_perf_mktg_cm","section": "PERFORMANCE MARKETING","target": 4,"actual": null,"unit": "ratio","direction": "higher_better","source": "Google Ads","series": [],"targetSource": "Google Ads"},{"id": "mkt_sourced_revenue","name": "MKT-Sourced Revenue","level": 1,"isMain": true,"parentId": null,"owner": "CM","ownerName": "Carlos Mitchell","boardId": "ecomm_perf_mktg_cm","section": "DEMAND GENERATION","target": null,"actual": null,"nodata": true,"nodataNote": "Attribution model: Net-New 100% / Re-Engaged 50% / Influenced credit-only. Feed from Power BI report (a0600d56). Not yet live on board.","unit": "$/mo","direction": "higher_better","source": "Power BI","rollupMethod": "external","contributors": ["leads_count","mql_count"],"flag": "MQL/SQL, Cost-per-MQL, AOV, Site-Conversion are net-new (not on this board today — live in Power BI/GA4/Search Console).","series": [],"illustrative": false,"targetSource": "Power BI"},{"id": "leads_count","name": "# of Marketing Leads","level": 2,"isMain": false,"parentId": "mkt_sourced_revenue","owner": "CM","ownerName": "Carlos Mitchell","boardId": "ecomm_perf_mktg_cm","section": "DEMAND GENERATION","target": 500,"actual": 208,"nodata": false,"nodataNote": "One real data point: Wk 9 (Feb 28 2026). Target 500/week, actual 208. All other weeks empty.","unit": "leads/week","direction": "higher_better","source": "HubSpot / CRM","rollupMethod": "external","contributors": [],"flag": "single_datapoint","series": [{"week": 9,"date": "2026-02-28","target": 500,"actual": 208}],"illustrative": false,"targetSource": "HubSpot"},{"id": "mql_count","name": "Marketing Qualified Leads (MQLs)","level": 2,"isMain": false,"parentId": "mkt_sourced_revenue","owner": "CM","ownerName": "Carlos Mitchell","boardId": "ecomm_perf_mktg_cm","section": "DEMAND GENERATION","target": 100,"actual": 79,"nodata": false,"nodataNote": "One real data point: Wk 9 (Feb 28 2026). Target 100/week, actual 79. All other weeks empty.","unit": "MQLs/week","direction": "higher_better","source": "HubSpot","contributors": [],"flag": "single_datapoint","series": [{"week": 9,"date": "2026-02-28","target": 100,"actual": 79}],"illustrative": false,"targetSource": "HubSpot"},{"id": "mql_to_sql_rate","name": "MQL to SQL Conversion Rate","level": 2,"isMain": false,"parentId": "mkt_sourced_revenue","owner": "CM","ownerName": "Carlos Mitchell","boardId": "ecomm_perf_mktg_cm","section": "DEMAND GENERATION","target": null,"actual": null,"nodata": true,"nodataNote": "Column present in CM board, no target or actuals entered. Net-new feed needed from HubSpot.","unit": "%","direction": "higher_better","source": "HubSpot","series": [],"targetSource": "HubSpot"},{"id": "cpl","name": "Cost Per Lead (CPL)","level": 2,"isMain": false,"parentId": "mkt_sourced_revenue","owner": "CM","ownerName": "Carlos Mitchell","boardId": "ecomm_perf_mktg_cm","section": "DEMAND GENERATION","target": null,"actual": null,"nodata": true,"nodataNote": "No target in CM board. PC Agency's Path has $110 CPL agency target — different scope.","unit": "$/lead","direction": "lower_better","source": "Ad platforms + HubSpot","series": [],"flag": "conflict — PC agency CPL target = $110; CM board has no CM-owned target set","targetSource": "HubSpot"},{"id": "branded_search_volume","name": "Branded Search Volume","level": 1,"isMain": true,"parentId": null,"owner": "PC","ownerName": "PC (full name unconfirmed)","boardId": "branding_creative_pc","section": "BRANDING","target": 900,"actual": 626,"nodata": false,"nodataNote": null,"unit": "sessions/week","direction": "higher_better","source": "Google Search Console (via Agency report)","rollupMethod": "manual","contributors": ["organic_traffic"],"flag": null,"attainment": 0.7,"attainmentNote": "Wk 26 (Jun 27): 626 vs target 900 = 70%. Trend improving from 165 (Wk 1 Jan) to 638 (Wk 21 May).","series": [{"week": 1,"date": "2026-01-03","target": 900,"actual": 165},{"week": 5,"date": "2026-01-31","target": 900,"actual": 393},{"week": 10,"date": "2026-03-07","target": 900,"actual": 241},{"week": 15,"date": "2026-04-11","target": 900,"actual": 219},{"week": 19,"date": "2026-05-09","target": 900,"actual": 483},{"week": 21,"date": "2026-05-23","target": 900,"actual": 638},{"week": 26,"date": "2026-06-27","target": 900,"actual": 626}],"illustrative": false,"targetSource": "Google Search Console"},{"id": "organic_traffic","name": "Organic Traffic","level": 2,"isMain": false,"parentId": "branded_search_volume","owner": "PC","ownerName": "PC (full name unconfirmed)","boardId": "branding_creative_pc","section": "BRANDING","target": 2500,"actual": 728,"nodata": false,"nodataNote": null,"unit": "sessions/week","direction": "higher_better","source": "Google Search Console","attainment": 0.29,"attainmentNote": "Wk 26: 728 vs target 2,500 = 29%. Peak was Wk 17 (Apr 25) at 1,383 (55%). Consistently below target.","series": [{"week": 1,"date": "2026-01-03","target": 2500,"actual": 723},{"week": 5,"date": "2026-01-31","target": 2500,"actual": 1074},{"week": 17,"date": "2026-04-25","target": 2500,"actual": 1383},{"week": 21,"date": "2026-05-23","target": 2500,"actual": 690},{"week": 26,"date": "2026-06-27","target": 2500,"actual": 728}],"illustrative": false,"targetSource": "Google Search Console"},{"id": "social_engagement_rate","name": "Social Media Brand Engagement Rate","level": 1,"isMain": true,"parentId": null,"owner": "PC","ownerName": "PC (full name unconfirmed)","boardId": "branding_creative_pc","section": "BRANDING","target": 0.09,"actual": 0.026,"nodata": false,"nodataNote": null,"unit": "rate (decimal)","direction": "higher_better","source": "Agency social report","contributors": ["linkedin_engagement_rate","meta_engagement_rate"],"attainment": 0.29,"attainmentNote": "WEI target 9%. Wk 26 actual 2.6% blended. LinkedIn frequently exceeds target; Meta drags the blended rate down.","series": [{"week": 1,"date": "2026-01-03","target": 0.05,"actual": 0.037},{"week": 5,"date": "2026-01-31","target": 0.05,"actual": 0.061},{"week": 17,"date": "2026-04-25","target": 0.05,"actual": 0.013},{"week": 26,"date": "2026-06-27","target": 0.05,"actual": 0.026}],"illustrative": false,"targetSource": "LinkedIn Analytics"},{"id": "linkedin_engagement_rate","name": "LinkedIn Engagement Rate","level": 2,"isMain": false,"parentId": "social_engagement_rate","owner": "PC","ownerName": "PC (full name unconfirmed)","boardId": "branding_creative_pc","section": "BRANDING","target": 0.09,"actual": 0.045,"nodata": false,"nodataNote": null,"unit": "rate (decimal)","direction": "higher_better","source": "LinkedIn Analytics","attainmentNote": "Frequently exceeds 9% target — Wk 5 peaked at 18%.","series": [{"week": 1,"date": "2026-01-03","target": 0.09,"actual": 0.1183},{"week": 5,"date": "2026-01-31","target": 0.09,"actual": 0.18},{"week": 21,"date": "2026-05-23","target": 0.09,"actual": 0.139},{"week": 26,"date": "2026-06-27","target": 0.09,"actual": 0.045}],"illustrative": false,"targetSource": "LinkedIn Analytics"},{"id": "meta_engagement_rate","name": "Meta Engagement Rate","level": 2,"isMain": false,"parentId": "social_engagement_rate","owner": "PC","ownerName": "PC (full name unconfirmed)","boardId": "branding_creative_pc","section": "BRANDING","target": 0.03,"actual": 0.026,"nodata": false,"nodataNote": null,"unit": "rate (decimal)","direction": "higher_better","source": "Meta Business Suite","attainmentNote": "Highly variable — ranges from 0.1% to 4.7%. Often well below 3% target.","series": [{"week": 1,"date": "2026-01-03","target": 0.03,"actual": 0.011},{"week": 3,"date": "2026-01-17","target": 0.03,"actual": 0.047},{"week": 5,"date": "2026-01-31","target": 0.03,"actual": 0.039},{"week": 26,"date": "2026-06-27","target": 0.03,"actual": 0.026}],"illustrative": false,"targetSource": "Meta Business Suite"},{"id": "social_media_growth","name": "Social Media Follower Growth","level": 1,"isMain": true,"parentId": null,"owner": "PC","ownerName": "PC (full name unconfirmed)","boardId": "branding_creative_pc","section": "BRANDING","target": 50000,"actual": 29984,"nodata": false,"nodataNote": "Target is a cumulative follower count goal (WEI). Jan 3 count: 27,190. Jun 27 count: 29,984. Net growth: +2,794.","unit": "cumulative followers","direction": "higher_better","source": "Agency social report","contributors": ["linkedin_followers","meta_followers"],"attainment": 0.6,"attainmentNote": "29,984 actual vs 50,000 target = 60% of cumulative target.","series": [{"week": 1,"date": "2026-01-03","target": 50000,"actual": 27190},{"week": 10,"date": "2026-03-07","target": 50000,"actual": 28253},{"week": 21,"date": "2026-05-23","target": 50000,"actual": 29497},{"week": 26,"date": "2026-06-27","target": 50000,"actual": 29984}],"illustrative": false,"targetSource": "LinkedIn Analytics"},{"id": "linkedin_followers","name": "LinkedIn Followers","level": 2,"isMain": false,"parentId": "social_media_growth","owner": "PC","ownerName": "PC (full name unconfirmed)","boardId": "branding_creative_pc","section": "BRANDING","target": 10000,"actual": 6894,"nodata": false,"nodataNote": null,"unit": "cumulative followers","direction": "higher_better","source": "LinkedIn Analytics","attainmentNote": "6,488 (Jan 3) → 6,894 (Jun 27). Net +406 in 26 weeks. Target 10,000.","series": [{"week": 1,"date": "2026-01-03","target": 10000,"actual": 6488},{"week": 10,"date": "2026-03-07","target": 10000,"actual": 6682},{"week": 21,"date": "2026-05-23","target": 10000,"actual": 6819},{"week": 26,"date": "2026-06-27","target": 10000,"actual": 6894}],"illustrative": false,"targetSource": "LinkedIn Analytics"},{"id": "meta_followers","name": "Meta Followers","level": 2,"isMain": false,"parentId": "social_media_growth","owner": "PC","ownerName": "PC (full name unconfirmed)","boardId": "branding_creative_pc","section": "BRANDING","target": 40000,"actual": 22861,"nodata": false,"nodataNote": null,"unit": "cumulative followers","direction": "higher_better","source": "Meta Business Suite","attainmentNote": "20,702 (Jan 3) → 22,861 (Jun 6). Net +2,159 in 23 weeks. Target 40,000.","series": [{"week": 1,"date": "2026-01-03","target": 40000,"actual": 20702},{"week": 10,"date": "2026-03-07","target": 40000,"actual": 21571},{"week": 21,"date": "2026-05-23","target": 40000,"actual": 22678},{"week": 23,"date": "2026-06-06","target": 40000,"actual": 22861}],"illustrative": false,"targetSource": "Meta Business Suite"},{"id": "pr_unique_viewers","name": "(PR) Unique Viewers Reached","level": 1,"isMain": true,"parentId": null,"owner": "PC","ownerName": "PC (full name unconfirmed)","boardId": "branding_creative_pc","section": "BRANDING","target": null,"actual": null,"nodata": true,"nodataNote": "Column present with sporadic impressions-scale data (641M Wk 9, 430M Wk 13) — likely cumulative earned media impressions, not a weekly unique viewer count. Flag for clarification with PC.","unit": "impressions (cumulative?)","direction": "higher_better","source": "PR agency report","contributors": ["direct_traffic"],"flag": "data_definition_unclear","series": [{"week": 9,"date": "2026-02-28","target": null,"actual": 641120755},{"week": 13,"date": "2026-03-28","target": null,"actual": 430370337}],"illustrative": false,"targetSource": "GA4"},{"id": "direct_traffic","name": "Direct Traffic","level": 2,"isMain": false,"parentId": "pr_unique_viewers","owner": "PC","ownerName": "PC (full name unconfirmed)","boardId": "branding_creative_pc","section": "BRANDING","target": null,"actual": null,"nodata": false,"nodataNote": null,"unit": "sessions/week","direction": "higher_better","source": "GA4","series": [{"week": 1,"date": "2026-01-03","target": null,"actual": 3530},{"week": 2,"date": "2026-01-10","target": null,"actual": 4713},{"week": 3,"date": "2026-01-17","target": null,"actual": 5447},{"week": 6,"date": "2026-02-07","target": null,"actual": 3167},{"week": 7,"date": "2026-02-14","target": null,"actual": 2756}],"illustrative": false,"targetSource": "GA4"},{"id": "blended_roas_agency","name": "Blended ROAS (Agency-Facing)","level": 1,"isMain": true,"parentId": null,"owner": "PC","ownerName": "PC (full name unconfirmed)","boardId": "branding_creative_pc","section": "AGENCY_PATH","target": 4,"actual": null,"nodata": true,"nodataNote": "Target set in Agency's Path sheet (flat across all 52 weeks). No actuals entered — this is the agency accountability target, not the internally-tracked ROAS.","unit": "ratio","direction": "higher_better","source": "Agency report","flag": "scope_conflict — CM board also tracks ROAS per paid channel (META=4, LinkedIn=3.5, Google=4). These are different scopes: PC/agency = blended all-in; CM = per paid channel.","series": [],"targetSource": "Agency report"},{"id": "cac_agency","name": "CAC — Agency-Facing","level": 2,"isMain": false,"parentId": "blended_roas_agency","owner": "PC","ownerName": "PC (full name unconfirmed)","boardId": "branding_creative_pc","section": "AGENCY_PATH","target": 38,"actual": null,"nodata": true,"unit": "$/customer","direction": "lower_better","source": "Agency report","series": [],"targetSource": "Agency report"},{"id": "cpl_agency","name": "CPL — Agency-Facing","level": 2,"isMain": false,"parentId": "blended_roas_agency","owner": "PC","ownerName": "PC (full name unconfirmed)","boardId": "branding_creative_pc","section": "AGENCY_PATH","target": 110,"actual": null,"nodata": true,"unit": "$/lead","direction": "lower_better","source": "Agency report","flag": "conflict — CM board CPL has no target set; PC agency CPL = $110. Need to align.","series": [],"targetSource": "Agency report"},{"id": "social_growth_agency","name": "Social Growth — Agency Target","level": 2,"isMain": false,"parentId": "social_media_growth","owner": "PC","ownerName": "PC (full name unconfirmed)","boardId": "branding_creative_pc","section": "AGENCY_PATH","target": 1000,"actual": null,"nodata": true,"nodataNote": "Agency's Path target: 1,000 new followers/week. No actuals entered.","unit": "new followers/week","direction": "higher_better","source": "Agency report","series": [],"targetSource": "Agency report"}],"ownershipModel": {"description": "Marketing is the only FMDS department with two distinct L2 owners operating in separate boards. The split is brand vs. revenue-performance.","owners": [{"code": "PC","name": "PC (full name unconfirmed)","domain": "Brand-building and awareness: search visibility, organic traffic, social presence, engagement, PR earned media, agency accountability (ROAS/CAC/CPL as brand-agency KPIs)","actualsSource": "Agency-reported (social platforms + Search Console + PR agency). Actuals actively maintained through Wk 26.","boardFile": "FMDS - Group  Branding & Creative 2026- PC.xlsx"},{"code": "CM","name": "Carlos Mitchell","domain": "Revenue conversion and paid performance: ecommerce revenue by channel (B2B/B2C/Amazon/Walmart), paid channel ROAS/CAC (META/LinkedIn/Google), demand generation (leads → MQLs → SQLs), CPL","actualsSource": "Rhythm 2025 (revenue actuals). HubSpot (leads/MQLs). Actuals largely not entered in this book — flows at CEO dashboard level.","boardFile": "FMDS - Group Ecomm & Performance Marketing 2026- CM.xlsx"}],"sharedKPIs": [{"kpi": "ROAS","pcScope": "Blended all-in ROAS (agency accountability) — target 4","cmScope": "Per-channel ROAS (META=4, LinkedIn=3.5, Google=4)","resolutionNeeded": true},{"kpi": "CPL","pcScope": "Agency CPL target = $110","cmScope": "No CM CPL target set in board","resolutionNeeded": true}]},"gaps": ["Revenue actuals (CM): No ecommerce revenue actuals in CM board — flows from Rhythm 2025 into CEO dashboard directly. data/marketing.json actuals_source = 'Rhythm 2025' for all CM revenue KPIs.","ROAS dual definition: PC agency ROAS (blended=4) vs CM per-channel ROAS (META=4, LinkedIn=3.5, Google=4). Need Randy/PC/CM to align on canonical definition.","CPL conflict: PC agency CPL target = $110; CM board has no CPL target. Need alignment.","MQL actual (Wk 9 only): Only one week of real MQL data — target 100, actual 79. All other weeks empty.","PR Unique Viewers Reached: Data definition unclear (641M and 430M values appear cumulative impressions, not weekly uniques). Flag for PC clarification.","Agency's Path sheet: 52 weeks of targets set (Blended ROAS=4, CAC=$38, CPL=$110, Social Growth=1,000/wk) with zero actuals entered. Agency feed needed.","No seasonal variation in targets: All 2026 targets are flat weekly values — no ramp curves. Flag to Randy.","PC owner full name: Only initials 'PC' from filename. Need to confirm full name.","CVR, AOV, Repeat Purchase, Cart Abandonment: All column structure present in CM board but no targets or actuals. Net-new feeds needed from GA4 / ecomm platform / CRM.","MQL/SQL, Cost-per-MQL, AOV, Site-Conversion: live in Power BI/GA4/Search Console — not yet on board.","WEI Total Leads Revenue and WE Revenue Incoming: pending external link connections to Rhythm and Ecomm workbooks.","Marketing is Tier 2 — full interface built; deep data deferred pending the marketing meeting."]},"data/odg.json": {"id": "odg","name": "ODG","lead": "Eric","mechanism": "avg","rollupMethod": "avg","note": "ODG is the method hub — training adoption, SRR adherence by department, KZ tracker, SOP library. R/A/G is formula-driven here (actual >= target → green), unlike other boards. SRR block and Training block both use actual>=target rule.","headline": {"adoptionGap": "FMDS adoption 93.2% vs 8-Step usage 18.9% — closing this gap is the product thesis.","fmdsAdoption": 0.932,"eightStepAdoption": 0.189},"kpis": [{"id": "training_overall","name": "Overall Training Plan vs Actual","level": 1,"isMain": true,"parentId": null,"target": 0.1,"actual": 0.447,"unit": "ratio","direction": "higher_better","source": "ODG FMDS Board","rollupMethod": "avg","contributors": ["training_sw_bwi","training_biq","training_fmds","training_leadership","training_jit","training_8step","training_srr_prog","training_idmp"],"flag": null,"note": "Target 0.1 is the monthly ramp target per program; cumulative adherence (latest weekly wk24) is the meaningful figure.","monthlyActuals": {"jan": 0.138,"feb": 0.145,"mar": 0.219},"series": [0.138,0.145,0.219,0.447],"targetSource": "ODG FMDS Board"},{"id": "training_sw_bwi","name": "Training — SW / PM / BWI","level": 2,"isMain": false,"parentId": "training_overall","target": 0.1,"actual": 0.227,"unit": "ratio","direction": "higher_better","source": "ODG FMDS Board","rollupMethod": null,"contributors": [],"flag": null,"monthlyActuals": {"jan": 0.116,"feb": 0.116,"mar": 0.116},"series": [0.116,0.116,0.116,0.227],"targetSource": "ODG FMDS Board"},{"id": "training_biq","name": "Training — BIQ","level": 2,"isMain": false,"parentId": "training_overall","target": 0.1,"actual": 0.154,"unit": "ratio","direction": "higher_better","source": "ODG FMDS Board","rollupMethod": null,"contributors": [],"flag": null,"monthlyActuals": {"jan": 0.15,"feb": 0.15,"mar": 0.151},"series": [0.15,0.15,0.151,0.154],"targetSource": "ODG FMDS Board"},{"id": "training_fmds","name": "Training — FMDS","level": 2,"isMain": false,"parentId": "training_overall","target": 0.1,"actual": 0.932,"unit": "ratio","direction": "higher_better","source": "ODG FMDS Board","rollupMethod": null,"contributors": [],"flag": null,"note": "93.2% adoption — the high-water mark. The adoption gap vs 8-Step (18.9%) is the product thesis.","monthlyActuals": {"jan": 0.133,"feb": 0.133,"mar": 0.614},"series": [0.133,0.133,0.614,0.932],"targetSource": "ODG FMDS Board"},{"id": "training_leadership","name": "Training — Leadership Application","level": 2,"isMain": false,"parentId": "training_overall","target": 0.1,"actual": 0.177,"unit": "ratio","direction": "higher_better","source": "ODG FMDS Board","rollupMethod": null,"contributors": [],"flag": null,"monthlyActuals": {"jan": 0.147,"feb": 0.147,"mar": 0.171},"series": [0.147,0.147,0.171,0.177],"targetSource": "ODG FMDS Board"},{"id": "training_jit","name": "Training — JIT","level": 2,"isMain": false,"parentId": "training_overall","target": 0.1,"actual": 0.11,"unit": "ratio","direction": "higher_better","source": "ODG FMDS Board","rollupMethod": null,"contributors": [],"flag": null,"monthlyActuals": {"jan": 0.08,"feb": 0.08,"mar": 0.097},"series": [0.08,0.08,0.097,0.11],"targetSource": "ODG FMDS Board"},{"id": "training_8step","name": "Training — 8-Step Problem Solving","level": 2,"isMain": false,"parentId": "training_overall","target": 0.1,"actual": 0.189,"unit": "ratio","direction": "higher_better","source": "ODG FMDS Board","rollupMethod": null,"contributors": [],"flag": null,"note": "18.9% — the low-adoption KPI vs FMDS 93.2%. This gap is the product thesis.","monthlyActuals": {"jan": 0.178,"feb": 0.178,"mar": 0.179},"series": [0.178,0.178,0.179,0.189],"targetSource": "ODG FMDS Board"},{"id": "training_srr_prog","name": "Training — SRR (as a program)","level": 2,"isMain": false,"parentId": "training_overall","target": 0.1,"actual": 0.865,"unit": "ratio","direction": "higher_better","source": "ODG FMDS Board","rollupMethod": null,"contributors": [],"flag": null,"monthlyActuals": {"jan": 0.22,"feb": 0.22,"mar": 0.237},"series": [0.22,0.22,0.237,0.865],"targetSource": "ODG FMDS Board"},{"id": "training_idmp","name": "Training — IDMP","level": 2,"isMain": false,"parentId": "training_overall","target": 0.1,"actual": 0.11,"unit": "ratio","direction": "higher_better","source": "ODG FMDS Board","rollupMethod": null,"contributors": [],"flag": null,"monthlyActuals": {"jan": 0.08,"feb": 0.08,"mar": 0.097},"series": [0.08,0.08,0.097,0.11],"targetSource": "ODG FMDS Board"},{"id": "srr_overall","name": "SRR Overall","level": 1,"isMain": true,"parentId": null,"target": 1,"actual": 0.083,"unit": "ratio","direction": "higher_better","source": "ODG FMDS Board","rollupMethod": "avg","contributors": ["srr_operations","srr_finance","srr_it","srr_sales_service","srr_marketing","srr_hr"],"flag": null,"note": "SRR overall ~8.3% because only Operations (~50%) is running its Strategic Review Rhythm. All other departments read 0. Confirm whether 0s represent true non-adoption vs not-yet-scored.","monthlyActuals": {"jan": 0.08,"feb": 0.08,"mar": 0.081},"series": [0.08,0.08,0.081,0.083],"targetSource": "ODG FMDS Board"},{"id": "srr_operations","name": "SRR — Operations","level": 2,"isMain": false,"parentId": "srr_overall","target": 1,"actual": 0.5,"unit": "ratio","direction": "higher_better","source": "ODG FMDS Board","rollupMethod": null,"contributors": [],"flag": null,"note": "Operations is the only department running SRR (~50%).","monthlyActuals": {"jan": 0.48,"feb": 0.48,"mar": 0.484},"series": [0.48,0.48,0.484,0.5],"targetSource": "ODG FMDS Board"},{"id": "srr_finance","name": "SRR — Finance","level": 2,"isMain": false,"parentId": "srr_overall","target": 1,"actual": 0,"unit": "ratio","direction": "higher_better","source": "ODG FMDS Board","rollupMethod": null,"contributors": [],"flag": null,"monthlyActuals": {"jan": 0,"feb": 0,"mar": 0},"series": [0,0,0,0],"targetSource": "ODG FMDS Board"},{"id": "srr_it","name": "SRR — IT","level": 2,"isMain": false,"parentId": "srr_overall","target": 1,"actual": 0,"unit": "ratio","direction": "higher_better","source": "ODG FMDS Board","rollupMethod": null,"contributors": [],"flag": null,"monthlyActuals": {"jan": 0,"feb": 0,"mar": 0},"series": [0,0,0,0],"targetSource": "ODG FMDS Board"},{"id": "srr_sales_service","name": "SRR — Sales / Service","level": 2,"isMain": false,"parentId": "srr_overall","target": 1,"actual": 0,"unit": "ratio","direction": "higher_better","source": "ODG FMDS Board","rollupMethod": null,"contributors": [],"flag": null,"monthlyActuals": {"jan": 0,"feb": 0,"mar": 0},"series": [0,0,0,0],"targetSource": "ODG FMDS Board"},{"id": "srr_marketing","name": "SRR — Marketing","level": 2,"isMain": false,"parentId": "srr_overall","target": 1,"actual": 0,"unit": "ratio","direction": "higher_better","source": "ODG FMDS Board","rollupMethod": null,"contributors": [],"flag": null,"monthlyActuals": {"jan": 0,"feb": 0,"mar": 0},"series": [0,0,0,0],"targetSource": "ODG FMDS Board"},{"id": "srr_hr","name": "SRR — HR","level": 2,"isMain": false,"parentId": "srr_overall","target": 1,"actual": 0,"unit": "ratio","direction": "higher_better","source": "ODG FMDS Board","rollupMethod": null,"contributors": [],"flag": null,"monthlyActuals": {"jan": 0,"feb": 0,"mar": 0},"series": [0,0,0,0],"targetSource": "ODG FMDS Board"}],"trainingPrograms": [{"id": "sw_bwi","name": "SW / PM / BWI","adoption": 0.227},{"id": "biq","name": "BIQ","adoption": 0.154},{"id": "fmds","name": "FMDS","adoption": 0.932},{"id": "leadership","name": "Leadership Application","adoption": 0.177},{"id": "jit","name": "JIT","adoption": 0.11},{"id": "eight_step","name": "8-Step Problem Solving","adoption": 0.189},{"id": "srr_prog","name": "SRR (as a program)","adoption": 0.865},{"id": "idmp","name": "IDMP","adoption": 0.11}],"gaps": ["SRR 0s: confirm whether true non-adoption or not-yet-scored.","ODG also has Safety block (Recordable Incidents, DART, Near Miss, First Aids) and MAIN EXTERNAL block (TRIR/DART/OTP/Gross Margin/Revenue pulled from CEO/HRD boards) — not extracted in detail; display-only context.","R/A/G: ODG is the exception — formula-driven (actual >= target = green) in training/SRR blocks."]},"data/operations.json": {"id": "operations","name": "Operations","lead": "Jim Kozel","mechanism": "independent","rollupMethod": "independent","mechanismNote": "Mechanism B — WE main is entered independently, NOT computed as an average or sum of location subs. Roll-up rule to confirm with Jim Kozel.","locations": ["mexico","norcross","houston","canada"],"noDataLocations": ["dr","hpi"],"noDataNote": "DR (Dominican Republic): placeholder columns exist but are entirely empty — no data. HPI: no OTP/PPLH/Materials column on the COO board; HPI appears only in Purchasing/Logistic sub-KPIs.","kpis": [{"id": "otp","name": "OTP (On-Time %)","level": 1,"isMain": true,"parentId": null,"target": 0.985,"actual": 0.863,"unit": "ratio","direction": "higher_better","targetSource": "WPS","source": "COO Board / hand-keyed weekly literals","rollupMethod": "independent","contributors": ["otp_mexico","otp_norcross","otp_houston","otp_canada"],"flag": null,"story": {"title": "T3 OTP Story (Jun 24 review)","text": "WE OTP appears red (0.863 Mar) primarily because Mexico is dragging the WE main hard — Mexico ran 0.39–0.55 on weekly OTP from ~week 15 onward vs a 0.985 target. The denominator was inflated by a sample-volume surge (1,917-sample backlog from a Galls color program), so the percentage looks worse than absolute pieces suggest. Overtime was also deployed. Houston and Norcross remain generally near target. The story: Mexico improved in absolute pieces, but the inflated denominator (sample surge) and the 1,917-piece backlog drove the percentage red. The 8-step question Jim wants answered: what part of the standard work broke? (Specifically the $40K short-code standard-work gap on the Galls color remake.)","denominatorNote": "Denominator inflated by sample-volume surge — sample rush orders included in OTP denominator.","backlogNote": "1,917-sample backlog at time of T3 review.","mechanismNote": "Mechanism B — main OTP is an independently entered number; simple vs. weighted average across locations is unconfirmed."},"monthlyActuals": {"we": {"jan": 0.9682,"feb": 0.9708,"mar": 0.863},"mexico": {"jan": 0.9388,"feb": 0.9552,"mar": 0.7504},"norcross": {"jan": 0.9896,"feb": 0.9818,"mar": 0.9552},"houston": {"jan": 0.9926,"feb": 0.995,"mar": 0.977},"canada": {"jan": 0.979,"feb": 0.9625,"mar": 0.9264},"dr": {"jan": null,"feb": null,"mar": null,"nodata": true},"hpi": {"nodata": true,"note": "No OTP column on COO board."}},"weeklyActuals": {"weeks": [15,16,17,18,19,20,21,22,23],"we": [0.716,0.66,0.674,0.683,0.598,0.644,0.665,0.698,0.736],"mexico": [0.546,0.445,0.477,0.525,0.394,0.442,0.475,0.549,0.541],"norcross": [0.984,0.951,0.97,0.88,0.954,0.915,0.863,0.858,0.957],"houston": [0.97,0.966,0.925,0.817,0.964,0.981,0.992,1,0.996],"canada": [0.945,0.863,0.884,0.952,0.931,0.913,0.848,0.97,0.933]},"fullSeriesNote": "Weeks 1–13 WE main (fuller series): [0.948, 0.943, 0.970, 0.985, 0.995, 0.987, 0.989, 0.966, 0.941, 0.912, 0.934, 0.873, 0.817].","series": [0.948,0.943,0.97,0.985,0.995,0.987,0.989,0.966,0.941,0.912,0.934,0.873,0.817]},{"id": "otp_mexico","name": "OTP — Mexico","level": 2,"isMain": false,"parentId": "otp","location": "mexico","target": 0.985,"actual": 0.75,"unit": "ratio","direction": "higher_better","targetSource": "WPS","source": "COO Board / hand-keyed","rollupMethod": null,"contributors": [],"flag": "RED — primary drag on WE OTP. Weekly range wk15–23: 0.39–0.55. T3 story: sample-volume surge inflated denominator; 1,917-sample backlog; overtime deployed.","series": [0.546,0.445,0.477,0.525,0.394,0.442,0.475,0.549,0.541]},{"id": "otp_norcross","name": "OTP — Norcross","level": 2,"isMain": false,"parentId": "otp","location": "norcross","target": 0.985,"actual": 0.957,"unit": "ratio","direction": "higher_better","targetSource": "WPS","source": "COO Board / hand-keyed","rollupMethod": null,"contributors": [],"flag": null,"series": [0.984,0.951,0.97,0.88,0.954,0.915,0.863,0.858,0.957]},{"id": "otp_houston","name": "OTP — Houston","level": 2,"isMain": false,"parentId": "otp","location": "houston","target": 0.985,"actual": 0.996,"unit": "ratio","direction": "higher_better","targetSource": "WPS","source": "COO Board / hand-keyed","rollupMethod": null,"contributors": [],"flag": null,"series": [0.97,0.966,0.925,0.817,0.964,0.981,0.992,1,0.996]},{"id": "otp_canada","name": "OTP — Canada","level": 2,"isMain": false,"parentId": "otp","location": "canada","target": 0.985,"actual": 0.933,"unit": "ratio","direction": "higher_better","targetSource": "WPS","source": "COO Board / hand-keyed","rollupMethod": null,"contributors": [],"flag": null,"series": [0.945,0.863,0.884,0.952,0.931,0.913,0.848,0.97,0.933]},{"id": "otp_dr","name": "OTP — DR","level": 2,"isMain": false,"parentId": "otp","location": "dr","target": 0.985,"actual": null,"nodata": true,"nodataNote": "DR placeholder columns exist but are entirely empty — no data.","unit": "ratio","direction": "higher_better","targetSource": "WPS","source": "COO Board","rollupMethod": null,"contributors": [],"flag": null,"series": []},{"id": "pplh","name": "PPLH (pieces/labor-hour)","level": 1,"isMain": true,"parentId": null,"target": 67.3,"actual": 73.41,"unit": "pcs/hr","direction": "higher_better","targetSource": "WPS","source": "COO Board / hand-keyed","rollupMethod": "independent","contributors": ["pplh_mexico","pplh_norcross","pplh_houston","pplh_canada"],"flag": null,"note": "WE main monthly: JAN 69.9, FEB 73.76, MAR 72.69. Values are flat monthly rates, not high-variance weekly telemetry.","monthlyActuals": {"we": {"jan": 69.9,"feb": 73.76,"mar": 72.69}},"series": [71.4,66.2,70.12,71.44,70.33,72.09,74.24,74.43,74.32,72.22,71.56,71.88,73.41]},{"id": "pplh_mexico","name": "PPLH — Mexico","level": 2,"isMain": false,"parentId": "pplh","location": "mexico","target": 67.3,"actual": 56.23,"unit": "pcs/hr","direction": "higher_better","targetSource": "WPS","source": "COO Board / hand-keyed","rollupMethod": null,"contributors": [],"flag": null,"note": "JAN–MAR rate 56.23; APR–JUN stepped to 57.32.","series": [56.23,56.23,56.23,56.23,56.23,56.23,56.23,56.23,56.23]},{"id": "pplh_norcross","name": "PPLH — Norcross","level": 2,"isMain": false,"parentId": "pplh","location": "norcross","target": 67.3,"actual": 99.5,"unit": "pcs/hr","direction": "higher_better","targetSource": "WPS","source": "COO Board / hand-keyed","rollupMethod": null,"contributors": [],"flag": null,"note": "JAN–MAR rate 99.50; APR–JUN stepped to 101.49.","series": [99.5,99.5,99.5,99.5,99.5,99.5,99.5,99.5,99.5]},{"id": "pplh_houston","name": "PPLH — Houston","level": 2,"isMain": false,"parentId": "pplh","location": "houston","target": 67.3,"actual": 63.65,"unit": "pcs/hr","direction": "higher_better","targetSource": "WPS","source": "COO Board / hand-keyed","rollupMethod": null,"contributors": [],"flag": null,"note": "JAN–MAR rate 63.65; APR–JUN stepped to 64.83.","series": [63.65,63.65,63.65,63.65,63.65,63.65,63.65,63.65,63.65]},{"id": "pplh_canada","name": "PPLH — Canada","level": 2,"isMain": false,"parentId": "pplh","location": "canada","target": 67.3,"actual": 109.47,"unit": "pcs/hr","direction": "higher_better","targetSource": "WPS","source": "COO Board / hand-keyed","rollupMethod": null,"contributors": [],"flag": null,"note": "JAN–MAR rate 109.47; APR–JUN stepped to 111.66.","series": [109.47,109.47,109.47,109.47,109.47,109.47,109.47,109.47,109.47]},{"id": "pplh_dr","name": "PPLH — DR","level": 2,"isMain": false,"parentId": "pplh","location": "dr","target": 67.3,"actual": null,"nodata": true,"nodataNote": "DR placeholder — no data.","unit": "pcs/hr","direction": "higher_better","targetSource": "WPS","source": "COO Board","rollupMethod": null,"contributors": [],"flag": null,"series": []},{"id": "pplh_hpi","name": "PPLH — HPI","level": 2,"isMain": false,"parentId": "pplh","location": "hpi","target": null,"actual": null,"nodata": true,"nodataNote": "No PPLH column for HPI on the COO board. HPI appears only in Purchasing/Logistic sub-KPIs.","unit": "pcs/hr","direction": "higher_better","targetSource": "WPS","source": null,"rollupMethod": null,"contributors": [],"flag": null,"series": []},{"id": "materials","name": "Materials $/Revenue","level": 1,"isMain": true,"parentId": null,"target": 0.157,"actual": 0.126,"unit": "ratio","direction": "lower_better","targetSource": "Business Central","source": "COO Board / cached from Mfg Gross Margin [4]","rollupMethod": "independent","contributors": ["materials_mexico","materials_norcross","materials_houston","materials_canada"],"flag": null,"note": "WE main has weekly actuals only (no monthly roll filled). Location subs are single flat literals from external Mfg Gross Margin feed.","series": [0.096,0.138,0.111,0.023,0.106,0.129,0.124,0.104,0.109,0.122,0.123,0.118,0.126]},{"id": "materials_mexico","name": "Materials — Mexico","level": 2,"isMain": false,"parentId": "materials","location": "mexico","target": 0.157,"actual": 0.114,"unit": "ratio","direction": "lower_better","targetSource": "Business Central","source": "COO Board / literal","rollupMethod": null,"contributors": [],"flag": null,"series": [0.114]},{"id": "materials_norcross","name": "Materials — Norcross","level": 2,"isMain": false,"parentId": "materials","location": "norcross","target": 0.157,"actual": 0.093,"unit": "ratio","direction": "lower_better","targetSource": "Business Central","source": "COO Board / literal","rollupMethod": null,"contributors": [],"flag": null,"series": [0.093]},{"id": "materials_houston","name": "Materials — Houston","level": 2,"isMain": false,"parentId": "materials","location": "houston","target": 0.157,"actual": 0.052,"unit": "ratio","direction": "lower_better","targetSource": "Business Central","source": "COO Board / literal","rollupMethod": null,"contributors": [],"flag": null,"series": [0.052]},{"id": "materials_canada","name": "Materials — Canada","level": 2,"isMain": false,"parentId": "materials","location": "canada","target": 0.157,"actual": 0.073,"unit": "ratio","direction": "lower_better","targetSource": "Business Central","source": "COO Board / literal","rollupMethod": null,"contributors": [],"flag": null,"series": [0.073]},{"id": "materials_dr","name": "Materials — DR","level": 2,"isMain": false,"parentId": "materials","location": "dr","target": 0.157,"actual": null,"nodata": true,"nodataNote": "DR placeholder — no data.","unit": "ratio","direction": "lower_better","targetSource": "Business Central","source": "COO Board","rollupMethod": null,"contributors": [],"flag": null,"series": []}],"gaps": ["DR: placeholder columns exist but are entirely empty for OTP, Materials, SRR. Show as no data.","HPI: no OTP/PPLH/Materials column on the COO board. HPI tile for main three = no source.","SRR Operations: fully unwired (zeros/blanks). Net-new feed needed.","Materials & Shipping Margin monthly rolls: blank (weekly only for WE main).","APR–DEC: mostly empty; data runs JAN–MAR monthly / ~week 23 weekly.","WE-main roll-up rule: Mechanism B — main is entered, not computed from location subs. Simple vs. weighted average unknown; confirm with Jim Kozel.","R/A/G thresholds: status is manual in the sheet; prototype derives from explicit rule vs target."],"locationBoards": {"_note": "Per-location FMDS boards from source Excel files. Units and target types differ per location — do NOT compare PPLH or External Remakes across locations without normalizing. Actuals from Data Base sheet, data_only=True, zero invented numbers.","_currentMonth": 7,"mexico": {"label": "Mexico","kpiCount": 103,"buildings": 4,"productionLines": ["Embroidery Emblems","Perfect Print","Print Stitch","Embroidery ASI","Chenille","Woven","Flexstyle","Leather","PV+","Supply Chain Blanks","Supply Chain Clean Cut","Warehouse","Art","Digitizing","Samples","Maintenance"],"actualsNote": "OTP + PPLH Jan–Sep populated. External Remakes: target set (count), actuals not entered in Data Base. Safety: all zeros (no incidents). Confirm April OTP context before surfacing (see flag).","operatorLayerNote": "Data Base sheet rows 11–22 (monthly) + rows 25–52+ (weekly). OTP main at col 104 (manual); 18 OTP sub-line actual cols (C110–C144 even) all blank. PPLH main at col 154 (manual); 15 PPLH sub-line actual cols blank. Main values are hand-keyed re-keys — no in-sheet formula aggregates sub-lines to main.","kpis": [{"id": "mx_safety_recordable","name": "Recordable Incidents","category": "SAFETY","level": "main","target": 0,"actual": 0,"unit": "count","targetType": "count","direction": "lower_better","targetSource": "Manual — reported","manualOnly": true,"monthlyActuals": {"JAN": 0,"FEB": 0,"MAR": 0,"APR": 0,"MAY": 0,"JUN": 0,"JUL": 0,"AUG": 0,"SEP": 0},"flag": null},{"id": "mx_safety_dart","name": "DART Incidents","category": "SAFETY","level": "main","target": 0,"actual": 0,"unit": "count","targetType": "count","direction": "lower_better","targetSource": "Manual — reported","manualOnly": true,"monthlyActuals": {"JAN": 0,"FEB": 0,"MAR": 0,"APR": 0,"MAY": 0,"JUN": 0,"JUL": 0,"AUG": 0,"SEP": 0},"flag": null},{"id": "mx_quality_external_remakes","name": "External Remakes","category": "QUALITY","level": "main","target": 13800,"actual": null,"unit": "count","targetType": "count","direction": "lower_better","targetSource": "WPS","nodata": true,"nodataNote": "Target = 13,800 count. Actuals not entered in Data Base — likely tracked only in DASHBOARD sheet or separate system.","flag": "actuals_missing"},{"id": "mx_quality_internal_remakes","name": "Internal Remakes","category": "QUALITY","level": "main","target": null,"actual": null,"unit": "count","targetType": "count","direction": "lower_better","targetSource": "WPS","nodata": true,"nodataNote": "Per-line targets and actuals not entered in Data Base at main level.","subLines": [{"line": "Embroidery Emblems","target": null,"actual": null},{"line": "Perfect Print","target": null,"actual": null},{"line": "Print Stitch","target": null,"actual": null},{"line": "Embroidery ASI","target": null,"actual": null},{"line": "Chenille","target": null,"actual": null},{"line": "Woven","target": null,"actual": null},{"line": "Flexstyle","target": null,"actual": null},{"line": "Leather","target": null,"actual": null},{"line": "PV+","target": null,"actual": null},{"line": "Supply Chain","target": null,"actual": null},{"line": "Warehouse","target": null,"actual": null},{"line": "Art","target": null,"actual": null},{"line": "Digitizing","target": null,"actual": null},{"line": "Samples","target": null,"actual": null}]},{"id": "mx_quality_prev_maint","name": "Preventive Maintenance","category": "QUALITY","level": "main","target": null,"actual": null,"unit": "PM tasks/month","targetType": "count","direction": "higher_better","targetSource": "WPS","mexicoOnly": true,"byBuilding": [{"building": 1,"target": 140,"actual": null},{"building": 2,"target": 280,"actual": null},{"building": 3,"target": 860,"actual": null},{"building": 4,"target": 900,"actual": null}],"nodataNote": "Targets set by building. Actuals not entered in Data Base."},{"id": "mx_delivery_otp","name": "OTP (On-Time %)","category": "SERVICE/DELIVERY","level": "main","target": 0.985,"actual": 0.9562,"unit": "ratio","targetType": "rate","direction": "higher_better","targetSource": "WPS","latestMonth": "JUL","monthlyActuals": {"JAN": 0.9552,"FEB": 0.9701,"MAR": 0.9229,"APR": 0.7894,"MAY": 0.9308,"JUN": 0.968,"JUL": 0.9562,"AUG": 0.9554,"SEP": 0.9234},"flag": "confirm_context","flagDetail": "April OTP = 78.9% vs 98.5% target — severe miss. Confirm context before surfacing in exec readout (equipment failure, staffing, or supply chain event unknown at time of export).","rollup": {"method": "manual_rekey","formula": null,"isManualRekey": true,"note": "Main OTP (Data Base col C104) is a hand-keyed monthly literal. Sub-line actual columns (C110–C144 even) exist but are all blank — sub-lines do NOT feed the main via any in-sheet formula."},"contributions": [{"label": "Embroidery Emblems","value": null,"unit": "ratio","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "mx_delivery_otp","dataBaseCol": "C110","targetCol": "C109","target": 0.985,"nodata": true},{"label": "Perfect Print","value": null,"unit": "ratio","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "mx_delivery_otp","dataBaseCol": "C112","targetCol": "C111","target": 0.985,"nodata": true},{"label": "Print Stitch","value": null,"unit": "ratio","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "mx_delivery_otp","dataBaseCol": "C114","targetCol": "C113","target": 0.985,"nodata": true},{"label": "Embroidery ASI","value": null,"unit": "ratio","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "mx_delivery_otp","dataBaseCol": "C116","targetCol": "C115","target": 0.985,"nodata": true},{"label": "Chenille","value": null,"unit": "ratio","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "mx_delivery_otp","dataBaseCol": "C118","targetCol": "C117","target": 0.985,"nodata": true},{"label": "Woven","value": null,"unit": "ratio","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "mx_delivery_otp","dataBaseCol": "C120","targetCol": "C119","target": 0.985,"nodata": true},{"label": "Flexstyle","value": null,"unit": "ratio","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "mx_delivery_otp","dataBaseCol": "C122","targetCol": "C121","target": 0.985,"nodata": true},{"label": "Leather","value": null,"unit": "ratio","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "mx_delivery_otp","dataBaseCol": "C124","targetCol": "C123","target": 0.985,"nodata": true},{"label": "PV+","value": null,"unit": "ratio","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "mx_delivery_otp","dataBaseCol": "C126","targetCol": "C125","target": 0.985,"nodata": true},{"label": "Supply Chain Blanks","value": null,"unit": "ratio","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "mx_delivery_otp","dataBaseCol": "C128","targetCol": "C127","target": 0.985,"nodata": true},{"label": "Supply Chain Clean Cut","value": null,"unit": "ratio","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "mx_delivery_otp","dataBaseCol": "C130","targetCol": "C129","target": 0.985,"nodata": true},{"label": "Blanks","value": null,"unit": "ratio","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "mx_delivery_otp","dataBaseCol": "C132","targetCol": "C131","target": 0.985,"nodata": true},{"label": "Raw","value": null,"unit": "ratio","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "mx_delivery_otp","dataBaseCol": "C134","targetCol": "C133","target": 0.985,"nodata": true},{"label": "Resale","value": null,"unit": "ratio","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "mx_delivery_otp","dataBaseCol": "C136","targetCol": "C135","target": 0.985,"nodata": true},{"label": "RSL Goods","value": null,"unit": "ratio","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "mx_delivery_otp","dataBaseCol": "C138","targetCol": "C137","target": 0.985,"nodata": true},{"label": "Art","value": null,"unit": "ratio","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "mx_delivery_otp","dataBaseCol": "C140","targetCol": "C139","target": 0.985,"nodata": true},{"label": "Digitizing","value": null,"unit": "ratio","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "mx_delivery_otp","dataBaseCol": "C142","targetCol": "C141","target": 0.985,"nodata": true},{"label": "Samples","value": null,"unit": "ratio","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "mx_delivery_otp","dataBaseCol": "C144","targetCol": "C143","target": 0.985,"nodata": true}],"subLines": [{"line": "Embroidery Emblems","target": 0.985,"actual": null},{"line": "Perfect Print","target": 0.985,"actual": null},{"line": "Print Stitch","target": 0.985,"actual": null},{"line": "Embroidery ASI","target": 0.985,"actual": null},{"line": "Chenille","target": 0.985,"actual": null},{"line": "Woven","target": 0.985,"actual": null},{"line": "Flexstyle","target": 0.985,"actual": null},{"line": "Leather","target": 0.985,"actual": null},{"line": "PV+","target": 0.985,"actual": null},{"line": "Supply Chain Blanks","target": 0.985,"actual": null},{"line": "Supply Chain Clean Cut","target": 0.985,"actual": null},{"line": "Blanks","target": 0.985,"actual": null},{"line": "Raw","target": 0.985,"actual": null},{"line": "Resale","target": 0.985,"actual": null},{"line": "RSL Goods","target": 0.985,"actual": null},{"line": "Art","target": 0.985,"actual": null},{"line": "Digitizing","target": 0.985,"actual": null},{"line": "Samples","target": 0.985,"actual": null}]},{"id": "mx_delivery_availability","name": "Availability","category": "SERVICE/DELIVERY","level": "main","target": 0.97,"actual": null,"unit": "ratio","targetType": "rate","direction": "higher_better","targetSource": "WPS","mexicoOnly": true,"nodataNote": "Equipment/line availability by Building. Targets set; actuals not entered in Data Base.","byBuilding": [{"building": 1,"target": 0.97,"actual": null},{"building": 2,"target": 0.97,"actual": null},{"building": 3,"target": 0.97,"actual": null},{"building": 4,"target": 0.97,"actual": null}]},{"id": "mx_cost_pplh","name": "PPLH","category": "COST","level": "main","target": 1,"actual": 1.089,"unit": "pcs_per_labor_hour","unitLabel": "pcs/labor-hr","targetType": "rate","direction": "higher_better","targetSource": "WPS","unitNote": "Mexico PPLH = pieces per labor hour (~1.0 main; 0.014–2.5 by line). NOT comparable to Houston aggregate hours.","latestMonth": "JUL","monthlyActuals": {"JAN": 1.246,"FEB": 1.066,"MAR": 1.085,"APR": 1.155,"MAY": 1.073,"JUN": 1.09,"JUL": 1.089,"AUG": 1.086,"SEP": 1.077},"rollup": {"method": "manual_rekey","formula": null,"isManualRekey": true,"note": "Main PPLH (Data Base col C154) is a hand-keyed monthly literal. Sub-line actual columns (C156, C158, …, C184 even) exist but are all blank — sub-lines do NOT feed the main via any in-sheet formula. Main entered as composite pcs/labor-hr ratio."},"contributions": [{"label": "Embroidery Emblems","value": null,"unit": "pcs_per_labor_hour","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "mx_cost_pplh","dataBaseCol": "C156","targetCol": "C155","target": 0.096,"nodata": true},{"label": "Perfect Print","value": null,"unit": "pcs_per_labor_hour","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "mx_cost_pplh","dataBaseCol": "C158","targetCol": "C157","target": 0.021,"nodata": true},{"label": "Print Stitch","value": null,"unit": "pcs_per_labor_hour","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "mx_cost_pplh","dataBaseCol": "C160","targetCol": "C159","target": 0.194,"nodata": true},{"label": "Embroidery ASI","value": null,"unit": "pcs_per_labor_hour","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "mx_cost_pplh","dataBaseCol": "C162","targetCol": "C161","target": 0.166,"nodata": true},{"label": "Chenille","value": null,"unit": "pcs_per_labor_hour","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "mx_cost_pplh","dataBaseCol": "C164","targetCol": "C163","target": 0.267,"nodata": true},{"label": "Woven","value": null,"unit": "pcs_per_labor_hour","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "mx_cost_pplh","dataBaseCol": "C166","targetCol": "C165","target": 0.21,"nodata": true},{"label": "Flexstyle","value": null,"unit": "pcs_per_labor_hour","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "mx_cost_pplh","dataBaseCol": "C168","targetCol": "C167","target": 0.133,"nodata": true},{"label": "Leather","value": null,"unit": "pcs_per_labor_hour","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "mx_cost_pplh","dataBaseCol": "C170","targetCol": "C169","target": 0.077,"nodata": true},{"label": "PV+","value": null,"unit": "pcs_per_labor_hour","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "mx_cost_pplh","dataBaseCol": "C172","targetCol": "C171","target": 0.323,"nodata": true},{"label": "Supply Chain Blanks","value": null,"unit": "pcs_per_labor_hour","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "mx_cost_pplh","dataBaseCol": "C174","targetCol": "C173","target": 0.014,"nodata": true},{"label": "Supply Chain Clean Cut","value": null,"unit": "pcs_per_labor_hour","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "mx_cost_pplh","dataBaseCol": "C176","targetCol": "C175","target": 0.04,"nodata": true},{"label": "Warehouse","value": null,"unit": "pcs_per_labor_hour","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "mx_cost_pplh","dataBaseCol": "C178","targetCol": "C177","target": 2.5,"nodata": true},{"label": "Art","value": null,"unit": "pcs_per_labor_hour","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "mx_cost_pplh","dataBaseCol": "C180","targetCol": "C179","target": 2.488,"nodata": true},{"label": "Digitizing","value": null,"unit": "pcs_per_labor_hour","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "mx_cost_pplh","dataBaseCol": "C182","targetCol": "C181","target": 2.017,"nodata": true},{"label": "Samples","value": null,"unit": "pcs_per_labor_hour","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "mx_cost_pplh","dataBaseCol": "C184","targetCol": "C183","target": 1.194,"nodata": true}],"subLines": [{"line": "Embroidery Emblems","target": 0.096,"actual": null,"unit": "pcs_per_labor_hour"},{"line": "Perfect Print","target": 0.021,"actual": null,"unit": "pcs_per_labor_hour"},{"line": "Print Stitch","target": 0.194,"actual": null,"unit": "pcs_per_labor_hour"},{"line": "Embroidery ASI","target": 0.166,"actual": null,"unit": "pcs_per_labor_hour"},{"line": "Chenille","target": 0.267,"actual": null,"unit": "pcs_per_labor_hour"},{"line": "Woven","target": 0.21,"actual": null,"unit": "pcs_per_labor_hour"},{"line": "Flexstyle","target": 0.133,"actual": null,"unit": "pcs_per_labor_hour"},{"line": "Leather","target": 0.077,"actual": null,"unit": "pcs_per_labor_hour"},{"line": "PV+","target": 0.323,"actual": null,"unit": "pcs_per_labor_hour"},{"line": "Supply Chain Blanks","target": 0.014,"actual": null,"unit": "pcs_per_labor_hour"},{"line": "Supply Chain Clean Cut","target": 0.04,"actual": null,"unit": "pcs_per_labor_hour"},{"line": "Warehouse","target": 2.5,"actual": null,"unit": "pcs_per_labor_hour"},{"line": "Art","target": 2.488,"actual": null,"unit": "pcs_per_labor_hour"},{"line": "Digitizing","target": 2.017,"actual": null,"unit": "pcs_per_labor_hour"},{"line": "Samples","target": 1.194,"actual": null,"unit": "pcs_per_labor_hour"}]},{"id": "mx_cost_spare_parts","name": "Spare Parts","category": "COST","level": "main","target": null,"actual": null,"unit": "count","targetType": "count","direction": "lower_better","targetSource": "WPS","mexicoOnly": true,"nodataNote": "Targets set by building; actuals not entered in Data Base.","byBuilding": [{"building": 1,"target": 25,"actual": null},{"building": 2,"target": 25,"actual": null},{"building": 3,"target": 70,"actual": null},{"building": 4,"target": 40,"actual": null}]},{"id": "mx_hrd_srr_supervisor","name": "SRR Supervisor","category": "HRD","level": "main","target": 0.8,"actual": 0.574,"unit": "ratio","targetType": "rate","direction": "higher_better","targetSource": "ODG","latestMonth": "SEP","supervisors": [{"name": "J. Morán","role": "Supervisor","target": 0.8,"actual": 0.57},{"name": "G. Navarro","role": "Supervisor","target": 0.8,"actual": 0.72},{"name": "A. Guardado","role": "Supervisor","target": 0.8,"actual": 0.52},{"name": "G. Velasco","role": "Supervisor","target": 0.8,"actual": 0.55},{"name": "A. Cortés","role": "Supervisor","target": 0.8,"actual": 0.51}],"note": "Supervisor actuals Jul–Sep entered. Average ~0.574 across 5 supervisors."},{"id": "mx_hrd_srr_tl","name": "SRR Team Leader","category": "HRD","level": "main","target": 0.8,"actual": 0.8,"unit": "ratio","targetType": "rate","direction": "higher_better","targetSource": "ODG","latestMonth": "SEP","monthlyActuals": {"JAN": 0.8,"FEB": 0.8,"MAR": 0.8,"APR": 0.8,"MAY": 0.8,"JUN": 0.8,"JUL": 0.8,"AUG": 0.8,"SEP": 0.8}}]},"houston": {"label": "Houston","kpiCount": 43,"buildings": 1,"productionLines": ["Direct Embroidery","Perfect Print","Richardson Application","Richardson Direct Embroidery","Richardson Leather","Single Head"],"actualsNote": "OTP + PPLH Jan–Jun populated. Remakes Jan–Jun populated. Safety: MAR had 1 Recordable + 1 DART (Richardson Direct Emb). Quality unit = rate (External Remakes target 0.0036); actuals entered as count — dual display needed.","operatorLayerNote": "Most complete board. OTP main (C48) + all 6 sub-line actuals (C52,C54,C56,C58,C60,C62) populated JAN–JUN — all manual. PPLH main (C64) is a SUM formula of 6 sub-line actuals (=BN+BP+BR+BT+BV+BX); sub-line actuals (C66,C68,C70,C72,C74,C76) manual. Houston is the ONLY location where PPLH main is computed rather than re-keyed.","kpis": [{"id": "hou_safety_recordable","name": "Recordable Incidents","category": "SAFETY","level": "main","target": 0,"actual": 1,"unit": "count","targetType": "count","direction": "lower_better","targetSource": "Manual — reported","manualOnly": true,"monthlyActuals": {"JAN": 0,"FEB": 0,"MAR": 1,"APR": 0,"MAY": 0,"JUN": 0},"flag": "MAR: 1 Recordable incident — Richardson Direct Embroidery line","subLines": [{"line": "Direct Embroidery","target": 0,"monthlyActuals": {"JAN": 0,"FEB": 0,"MAR": 0,"APR": 0,"MAY": 0,"JUN": 0}},{"line": "Perfect Print","target": 0,"monthlyActuals": {"JAN": 0,"FEB": 0,"MAR": 0,"APR": 0,"MAY": 0,"JUN": 0}},{"line": "Richardson Application","target": 0,"monthlyActuals": {"JAN": 0,"FEB": 0,"MAR": 0,"APR": 0,"MAY": 0,"JUN": 0}},{"line": "Richardson Direct Embroidery","target": 0,"monthlyActuals": {"JAN": 0,"FEB": 0,"MAR": 1,"APR": 0,"MAY": 0,"JUN": 0}},{"line": "Richardson Leather","target": 0,"monthlyActuals": {"JAN": 0,"FEB": 0,"MAR": 0,"APR": 0,"MAY": 0,"JUN": 0}},{"line": "Single Head","target": 0,"monthlyActuals": {"JAN": 0,"FEB": 0,"MAR": 0,"APR": 0,"MAY": 0,"JUN": 0}}]},{"id": "hou_safety_dart","name": "DART Incidents","category": "SAFETY","level": "main","target": 0,"actual": 1,"unit": "count","targetType": "count","direction": "lower_better","targetSource": "Manual — reported","manualOnly": true,"monthlyActuals": {"JAN": 0,"FEB": 0,"MAR": 1,"APR": 0,"MAY": 0,"JUN": 0},"flag": "MAR: 1 DART incident — Richardson Direct Embroidery line","subLines": [{"line": "Richardson Direct Embroidery","target": 0,"monthlyActuals": {"JAN": 0,"FEB": 0,"MAR": 1,"APR": 0,"MAY": 0,"JUN": 0}}]},{"id": "hou_quality_external_remakes","name": "External Remakes","category": "QUALITY","level": "main","target": 0.0036,"actual": 2602,"unit": "rate","targetType": "rate","actualUnit": "count","direction": "lower_better","targetSource": "WPS","unitNote": "Houston External Remakes target = defect rate (0.0036). Actuals entered as raw count in Data Base — dual display: target as rate, actuals as count.","monthlyActuals": {"JAN": 4358,"FEB": 5415,"MAR": 772,"APR": 2955,"MAY": 2241,"JUN": 2602},"flag": "unit_mismatch — target is rate (0.0036), actuals are count. Do NOT compute ratio directly."},{"id": "hou_quality_internal_remakes","name": "Internal Remakes","category": "QUALITY","level": "main","target": 0,"actual": null,"unit": "count","targetType": "count","direction": "lower_better","targetSource": "WPS","subLines": [{"line": "Direct Embroidery","target": 0,"monthlyActuals": {"JAN": 0,"FEB": null,"MAR": null,"APR": null,"MAY": null,"JUN": 82}},{"line": "Perfect Print","target": 0,"monthlyActuals": {"JAN": 93,"FEB": null,"MAR": null,"APR": null,"MAY": null,"JUN": 0}},{"line": "Richardson Application","target": 0,"monthlyActuals": {"JAN": 10,"FEB": null,"MAR": null,"APR": null,"MAY": null,"JUN": 0}},{"line": "Richardson Direct Embroidery","target": 0,"monthlyActuals": {"JAN": 31,"FEB": null,"MAR": null,"APR": null,"MAY": null,"JUN": 75}},{"line": "Richardson Leather","target": 0,"monthlyActuals": {"JAN": 0,"FEB": null,"MAR": null,"APR": null,"MAY": null,"JUN": 0}},{"line": "Single Head","target": 0,"monthlyActuals": {"JAN": 502,"FEB": null,"MAR": null,"APR": null,"MAY": null,"JUN": 2445}}]},{"id": "hou_delivery_otp","name": "OTP (On-Time %)","category": "SERVICE/DELIVERY","level": "main","target": 0.985,"actual": 0.974,"unit": "ratio","targetType": "rate","direction": "higher_better","targetSource": "WPS","latestMonth": "JUN","monthlyActuals": {"JAN": 0.994,"FEB": 0.99,"MAR": 0.9618,"APR": 0.952,"MAY": 0.983,"JUN": 0.974},"rollup": {"method": "manual_rekey","formula": null,"isManualRekey": true,"note": "Houston OTP main (C48) is a hand-keyed monthly literal. Sub-line actuals (C52,C54,C56,C58,C60,C62) are also manual — populated JAN–JUN. Sub-lines do NOT feed the main via any in-sheet formula; the main is an independent entry."},"contributions": [{"label": "Direct Embroidery","value": 0.9818,"unit": "ratio","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "hou_delivery_otp","dataBaseCol": "C52","targetCol": "C51","target": 0.985,"monthlyActuals": {"JAN": 0.985,"FEB": 0.994,"MAR": 0.956,"APR": 0.938,"MAY": 0.9849,"JUN": 0.9818}},{"label": "Perfect Print","value": 0.9561,"unit": "ratio","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "hou_delivery_otp","dataBaseCol": "C54","targetCol": "C53","target": 0.985,"monthlyActuals": {"JAN": 0.9992,"FEB": 0.983,"MAR": 0.98,"APR": 0.977,"MAY": 0.9759,"JUN": 0.9561}},{"label": "Richardson Application","value": 0.9818,"unit": "ratio","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "hou_delivery_otp","dataBaseCol": "C56","targetCol": "C55","target": 0.985,"monthlyActuals": {"JAN": 0.985,"FEB": 0.994,"MAR": 0.956,"APR": 0.938,"MAY": 0.9849,"JUN": 0.9818}},{"label": "Richardson Direct Embroidery","value": 0.9818,"unit": "ratio","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "hou_delivery_otp","dataBaseCol": "C58","targetCol": "C57","target": 0.985,"monthlyActuals": {"JAN": 0.985,"FEB": 0.994,"MAR": 0.956,"APR": 0.938,"MAY": 0.9849,"JUN": 0.9818}},{"label": "Richardson Leather","value": 0.9818,"unit": "ratio","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "hou_delivery_otp","dataBaseCol": "C60","targetCol": "C59","target": 0.985,"monthlyActuals": {"JAN": 0.985,"FEB": 0.994,"MAR": 0.956,"APR": 0.938,"MAY": 0.9849,"JUN": 0.9818}},{"label": "Single Head","value": 0.9581,"unit": "ratio","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "hou_delivery_otp","dataBaseCol": "C62","targetCol": "C61","target": 0.985,"monthlyActuals": {"JAN": 0.9992,"FEB": 0.97,"MAR": 0.967,"APR": 0.983,"MAY": 0.983,"JUN": 0.9581}}],"subLines": [{"line": "Direct Embroidery","target": 0.985,"monthlyActuals": {"JAN": 0.985,"FEB": 0.994,"MAR": 0.956,"APR": 0.938,"MAY": 0.9849,"JUN": 0.9818}},{"line": "Perfect Print","target": 0.985,"monthlyActuals": {"JAN": 0.9992,"FEB": 0.983,"MAR": 0.98,"APR": 0.977,"MAY": 0.9759,"JUN": 0.9561}},{"line": "Richardson Application","target": 0.985,"monthlyActuals": {"JAN": 0.985,"FEB": 0.994,"MAR": 0.956,"APR": 0.938,"MAY": 0.9849,"JUN": 0.9818}},{"line": "Richardson Direct Embroidery","target": 0.985,"monthlyActuals": {"JAN": 0.985,"FEB": 0.994,"MAR": 0.956,"APR": 0.938,"MAY": 0.9849,"JUN": 0.9818}},{"line": "Richardson Leather","target": 0.985,"monthlyActuals": {"JAN": 0.985,"FEB": 0.994,"MAR": 0.956,"APR": 0.938,"MAY": 0.9849,"JUN": 0.9818}},{"line": "Single Head","target": 0.985,"monthlyActuals": {"JAN": 0.9992,"FEB": 0.97,"MAR": 0.967,"APR": 0.983,"MAY": 0.983,"JUN": 0.9581}}]},{"id": "hou_cost_pplh","name": "PPLH","category": "COST","level": "main","target": 409.3,"actual": 374.55,"unit": "aggregate_labor_hours","unitLabel": "agg. labor-hrs","targetType": "aggregate","direction": "lower_better","targetSource": "WPS","unitNote": "Houston PPLH = aggregate labor hours (target 409.3). NOT pieces-per-hour — this is total headcount-hours tracked. Lower = more efficient. NOT comparable to Mexico pcs/labor-hr.","latestMonth": "JUN","monthlyActuals": {"JAN": 444.34,"FEB": 408.08,"MAR": 407.9,"APR": 416.85,"MAY": 328.47,"JUN": 374.55},"rollup": {"method": "sum","formula": "=BN{row}+BP{row}+BR{row}+BT{row}+BV{row}+BX{row}","formulaDescription": "SUM of 6 sub-line aggregate labor-hour actuals (Direct Emb + Perfect Print + Richardson App + Richardson DE + Richardson Leather + Single Head). Each sub-line col is a manual entry; main col is formula. JAN C64 was a manual literal; FEB–JUN confirmed as formula.","isManualRekey": false,"note": "CONFIRMED FORMULA ROLL-UP. Only location in all four Operations boards where PPLH main is computed rather than re-keyed. Sub-line actuals at cols C66/C68/C70/C72/C74/C76 are all manual literals; the SUM formula at C64 aggregates them."},"contributions": [{"label": "Direct Embroidery","value": 18.84,"unit": "aggregate_labor_hours","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "hou_cost_pplh","dataBaseCol": "C66","targetCol": "C65","target": 15,"monthlyActuals": {"JAN": 16.42,"FEB": 12.71,"MAR": 12.7,"APR": 14.13,"MAY": 11.84,"JUN": 18.84}},{"label": "Perfect Print","value": 167.87,"unit": "aggregate_labor_hours","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "hou_cost_pplh","dataBaseCol": "C68","targetCol": "C67","target": 158,"monthlyActuals": {"JAN": 187.34,"FEB": 185.17,"MAR": 185.1,"APR": 176.36,"MAY": 147.36,"JUN": 167.87}},{"label": "Richardson Application","value": 26.56,"unit": "aggregate_labor_hours","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "hou_cost_pplh","dataBaseCol": "C70","targetCol": "C69","target": 35.5,"monthlyActuals": {"JAN": 40.84,"FEB": 28.48,"MAR": 25.1,"APR": 36.37,"MAY": 25.88,"JUN": 26.56}},{"label": "Richardson Direct Embroidery","value": 14.77,"unit": "aggregate_labor_hours","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "hou_cost_pplh","dataBaseCol": "C72","targetCol": "C71","target": 14.9,"monthlyActuals": {"JAN": 14.22,"FEB": 13.96,"MAR": 13.9,"APR": 16.35,"MAY": 11.94,"JUN": 14.77}},{"label": "Richardson Leather","value": 28.4,"unit": "aggregate_labor_hours","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "hou_cost_pplh","dataBaseCol": "C74","targetCol": "C73","target": 33,"monthlyActuals": {"JAN": 17.21,"FEB": 25.13,"MAR": 28.5,"APR": 34.3,"MAY": 22.55,"JUN": 28.4}},{"label": "Single Head","value": 118.11,"unit": "aggregate_labor_hours","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "hou_cost_pplh","dataBaseCol": "C76","targetCol": "C75","target": 125.5,"monthlyActuals": {"JAN": 138.58,"FEB": 142.63,"MAR": 142.6,"APR": 139.34,"MAY": 108.9,"JUN": 118.11}}],"subLines": [{"line": "Direct Embroidery","target": 15,"monthlyActuals": {"JAN": 16.42,"FEB": 12.71,"MAR": 12.7,"APR": 14.13,"MAY": 11.84,"JUN": 18.84},"unit": "aggregate_labor_hours"},{"line": "Perfect Print","target": 158,"monthlyActuals": {"JAN": 187.34,"FEB": 185.17,"MAR": 185.1,"APR": 176.36,"MAY": 147.36,"JUN": 167.87},"unit": "aggregate_labor_hours"},{"line": "Richardson Application","target": 35.5,"monthlyActuals": {"JAN": 40.84,"FEB": 28.48,"MAR": 25.1,"APR": 36.37,"MAY": 25.88,"JUN": 26.56},"unit": "aggregate_labor_hours"},{"line": "Richardson Direct Embroidery","target": 14.9,"monthlyActuals": {"JAN": 14.22,"FEB": 13.96,"MAR": 13.9,"APR": 16.35,"MAY": 11.94,"JUN": 14.77},"unit": "aggregate_labor_hours"},{"line": "Richardson Leather","target": 33,"monthlyActuals": {"JAN": 17.21,"FEB": 25.13,"MAR": 28.5,"APR": 34.3,"MAY": 22.55,"JUN": 28.4},"unit": "aggregate_labor_hours"},{"line": "Single Head","target": 125.5,"monthlyActuals": {"JAN": 138.58,"FEB": 142.63,"MAR": 142.6,"APR": 139.34,"MAY": 108.9,"JUN": 118.11},"unit": "aggregate_labor_hours"}]},{"id": "hou_hrd_srr_supervisor","name": "SRR Supervisor","category": "HRD","level": "main","target": 0.8,"actual": 0.8,"unit": "ratio","targetType": "rate","direction": "higher_better","targetSource": "ODG","supervisors": [{"name": "M. Stone","role": "Team Leader","target": 0.8,"actual": 0.8,"note": "Consistent 0.8 all months"},{"name": "N. Costa / N. Acosta","role": "Supervisor","target": 0.8,"actual": null},{"name": "M. Perez","role": "Supervisor","target": 0.62,"actual": null,"note": "New supervisor mid-year — lower initial target starting APR (0.62 vs standard 0.8)"}]},{"id": "hou_hrd_srr_tl","name": "SRR Team Leader","category": "HRD","level": "main","target": 0.8,"actual": 0.8,"unit": "ratio","targetType": "rate","direction": "higher_better","note": "M. Stone Team Leader actual = 0.8 all months.","targetSource": "ODG"}]},"norcross": {"label": "Norcross","kpiCount": 33,"buildings": 1,"productionLines": ["Direct Embroidery","Single Head","Perfect Print","NBI (CG)"],"weeklyLabel": "DAYS","actualsNote": "Least populated board. OTP has targets only (no actuals entered). PPLH: NBI (CG) target=30, others unset. Remakes: Jan only (2 Direct Emb, 2 Single Head). Safety: Jan–Feb NBI (CG) DART incidents. SRR: TL actuals populated.","operatorLayerNote": "Data Base cols C33–C42 (OTP: main + 4 sub-lines) and C43–C52 (PPLH: main + 4 sub-lines). All actual columns (C34,C36,C38,C40,C42,C44,C46,C48,C50,C52) are blank for all 12 months. Only target constants entered. Board is configured but not actively maintained for actuals.","kpis": [{"id": "nor_safety_recordable","name": "Recordable Incidents","category": "SAFETY","level": "main","target": 0,"actual": 0,"unit": "count","targetType": "count","direction": "lower_better","monthlyActuals": {"JAN": 0,"FEB": 0},"subLines": [{"line": "Direct Embroidery","target": 0,"actual": 0},{"line": "Single Head","target": 0,"actual": 0},{"line": "Perfect Print","target": 0,"actual": 0},{"line": "NBI (CG)","target": 0,"actual": 0}],"targetSource": "Manual — reported","manualOnly": true},{"id": "nor_safety_dart","name": "DART Incidents","category": "SAFETY","level": "main","target": 0,"actual": 2,"unit": "count","targetType": "count","direction": "lower_better","monthlyActuals": {"JAN": 1,"FEB": 2},"flag": "JAN: 1 DART (NBI/CG line); FEB: 2 DART (NBI/CG line)","subLines": [{"line": "NBI (CG)","target": 0,"monthlyActuals": {"JAN": 1,"FEB": 2}}],"targetSource": "Manual — reported","manualOnly": true},{"id": "nor_quality_external_remakes","name": "External Remakes","category": "QUALITY","level": "main","target": 0,"actual": null,"unit": "count","targetType": "count","direction": "lower_better","nodata": true,"nodataNote": "Target = 0 (count). No actuals entered.","targetSource": "WPS"},{"id": "nor_quality_internal_remakes","name": "Internal Remakes","category": "QUALITY","level": "main","target": 0,"actual": 4,"unit": "count","targetType": "count","direction": "lower_better","subLines": [{"line": "Direct Embroidery","target": 0,"monthlyActuals": {"JAN": 2,"FEB": null}},{"line": "Single Head","target": 0,"monthlyActuals": {"JAN": 2,"FEB": null}},{"line": "Perfect Print","target": 0,"monthlyActuals": {"JAN": null,"FEB": null}},{"line": "NBI (CG)","target": 0,"monthlyActuals": {"JAN": null,"FEB": null}}],"note": "JAN only: Direct Emb 2, Single Head 2. All other months empty.","targetSource": "WPS"},{"id": "nor_delivery_otp","name": "OTP (On-Time %)","category": "SERVICE/DELIVERY","level": "main","target": 0.985,"actual": null,"unit": "ratio","targetType": "rate","direction": "higher_better","nodata": true,"nodataNote": "Target = 98.5%. All monthly actuals = None (not entered). Board structurally configured but not actively maintained.","rollup": {"method": "manual_rekey","formula": null,"isManualRekey": true,"note": "Norcross OTP main (C34) and all 4 sub-line actuals (C36,C38,C40,C42) are blank — no actuals entered. Targets only. Roll-up type is manual_rekey by design (same as other locations), confirmed by blank actual columns."},"contributions": [{"label": "Direct Embroidery","value": null,"unit": "ratio","entryType": "manual","targetSource": "WPS","formula": null,"owner": "Z. Rivas (TL)","rollsUpTo": "nor_delivery_otp","dataBaseCol": "C36","targetCol": "C35","target": 0.985,"nodata": true},{"label": "Single Head","value": null,"unit": "ratio","entryType": "manual","targetSource": "WPS","formula": null,"owner": "R. Trotter (TL)","rollsUpTo": "nor_delivery_otp","dataBaseCol": "C38","targetCol": "C37","target": 0.985,"nodata": true},{"label": "Perfect Print","value": null,"unit": "ratio","entryType": "manual","targetSource": "WPS","formula": null,"owner": "L. Morrison (Supervisor)","rollsUpTo": "nor_delivery_otp","dataBaseCol": "C40","targetCol": "C39","target": 0.985,"nodata": true},{"label": "NBI (CG)","value": null,"unit": "ratio","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "nor_delivery_otp","dataBaseCol": "C42","targetCol": "C41","target": 0.985,"nodata": true}],"subLines": [{"line": "Direct Embroidery","target": 0.985,"actual": null},{"line": "Single Head","target": 0.985,"actual": null},{"line": "Perfect Print","target": 0.985,"actual": null},{"line": "NBI (CG)","target": 0.985,"actual": null}],"targetSource": "WPS"},{"id": "nor_cost_pplh","name": "PPLH","category": "COST","level": "main","target": null,"actual": null,"unit": "not_set","targetType": "not_set","direction": "higher_better","nodata": true,"nodataNote": "Main PPLH target not set. NBI (CG) sub-KPI target = 30 (all months, col C51). Direct Emb, Single Head, Perfect Print targets = None. All actuals blank.","rollup": {"method": "manual_rekey","formula": null,"isManualRekey": true,"note": "Norcross PPLH main (C44) and all sub-line actuals (C46,C48,C50,C52) blank. NBI (CG) target = 30 (C51) — only populated target in PPLH section. No roll-up formula present."},"contributions": [{"label": "Direct Embroidery","value": null,"unit": "not_set","entryType": "manual","targetSource": "WPS","formula": null,"owner": "Z. Rivas (TL)","rollsUpTo": "nor_cost_pplh","dataBaseCol": "C46","targetCol": "C45","target": null,"nodata": true},{"label": "Single Head","value": null,"unit": "not_set","entryType": "manual","targetSource": "WPS","formula": null,"owner": "R. Trotter (TL)","rollsUpTo": "nor_cost_pplh","dataBaseCol": "C48","targetCol": "C47","target": null,"nodata": true},{"label": "Perfect Print","value": null,"unit": "not_set","entryType": "manual","targetSource": "WPS","formula": null,"owner": "L. Morrison (Supervisor)","rollsUpTo": "nor_cost_pplh","dataBaseCol": "C50","targetCol": "C49","target": null,"nodata": true},{"label": "NBI (CG)","value": null,"unit": "not_set","entryType": "manual","targetSource": "WPS","formula": null,"owner": null,"rollsUpTo": "nor_cost_pplh","dataBaseCol": "C52","targetCol": "C51","target": 30,"nodata": true,"note": "Only PPLH sub-KPI with target set (=30). Unit not confirmed."}],"subLines": [{"line": "Direct Embroidery","target": null,"actual": null},{"line": "Single Head","target": null,"actual": null},{"line": "Perfect Print","target": null,"actual": null},{"line": "NBI (CG)","target": 30,"actual": null,"unit": "not_set","note": "NBI (CG) target = 30. Unit not confirmed."}],"targetSource": "WPS"},{"id": "nor_hrd_srr_supervisor","name": "SRR Supervisor","category": "HRD","level": "main","target": 0.8,"actual": 0.8,"unit": "ratio","targetType": "rate","direction": "higher_better","supervisors": [{"name": "R. Trotter","role": "Team Leader","target": 0.8,"actual": 0.8,"note": "0.8 all months"},{"name": "L. Morrison","role": "Supervisor","target": 0.8,"actual": null},{"name": "Z. Rivas","role": "Team Leader","target": 0.8,"actual": 0.8,"note": "0.8 all months"}],"targetSource": "ODG"},{"id": "nor_hrd_srr_tl","name": "SRR Team Leader","category": "HRD","level": "main","target": 0.8,"actual": 0.8,"unit": "ratio","targetType": "rate","direction": "higher_better","note": "R. Trotter and Z. Rivas both at 0.8 all months.","targetSource": "ODG"}]},"canada": {"label": "Canada","kpiCount": 24,"buildings": 1,"productionLines": ["Embroidery","Perfect Print","Single Head"],"actualsNote": "Sparsest board — only SRR Team Leader actuals exist. OTP, PPLH, External/Internal Remakes: targets only (no actuals). Safety: all zero. Board appears newly initialized.","operatorLayerNote": "Data Base cols C27–C34 (OTP: main + 3 sub-lines) and C35–C42 (PPLH: main + 3 sub-lines). All actual columns blank for all 12 months. Named line operators: Embroidery=Ana, Perfect Print=Gagandeep, Single Head=Gina (identified in row 106). Supervisor: E. Guayabo.","kpis": [{"id": "can_safety_recordable","name": "Recordable Incidents","category": "SAFETY","level": "main","target": 0,"actual": 0,"unit": "count","targetType": "count","direction": "lower_better","monthlyActuals": {"JAN": 0,"FEB": 0,"MAR": 0},"subLines": [{"line": "Embroidery","target": 0,"actual": 0},{"line": "Perfect Print","target": 0,"actual": 0},{"line": "Single Head","target": 0,"actual": 0}],"targetSource": "Manual — reported","manualOnly": true},{"id": "can_safety_dart","name": "DART Incidents","category": "SAFETY","level": "main","target": 0,"actual": 0,"unit": "count","targetType": "count","direction": "lower_better","monthlyActuals": {"JAN": 0,"FEB": 0,"MAR": 0},"targetSource": "Manual — reported","manualOnly": true},{"id": "can_quality_external_remakes","name": "External Remakes","category": "QUALITY","level": "main","target": 0,"actual": null,"unit": "count","targetType": "count","direction": "lower_better","nodata": true,"nodataNote": "Target = 0 (count). No actuals entered.","targetSource": "WPS"},{"id": "can_quality_internal_remakes","name": "Internal Remakes","category": "QUALITY","level": "main","target": 0,"actual": null,"unit": "count","targetType": "count","direction": "lower_better","nodata": true,"nodataNote": "All actuals = None. Board not actively populated.","subLines": [{"line": "Embroidery","target": 0,"actual": null},{"line": "Perfect Print","target": 0,"actual": null},{"line": "Single Head","target": 0,"actual": null}],"targetSource": "WPS"},{"id": "can_delivery_otp","name": "OTP (On-Time %)","category": "SERVICE/DELIVERY","level": "main","target": 0.985,"actual": null,"unit": "ratio","targetType": "rate","direction": "higher_better","nodata": true,"nodataNote": "Target = 98.5%. All monthly actuals = None (not entered).","rollup": {"method": "manual_rekey","formula": null,"isManualRekey": true,"note": "Canada OTP main (C28) and all 3 sub-line actuals (C30,C32,C34) blank. Targets entered (0.985 manual). No formula roll-up. Board not actively maintained."},"contributions": [{"label": "Embroidery","value": null,"unit": "ratio","entryType": "manual","targetSource": "WPS","formula": null,"owner": "Ana","rollsUpTo": "can_delivery_otp","dataBaseCol": "C30","targetCol": "C29","target": 0.985,"nodata": true},{"label": "Perfect Print","value": null,"unit": "ratio","entryType": "manual","targetSource": "WPS","formula": null,"owner": "Gagandeep","rollsUpTo": "can_delivery_otp","dataBaseCol": "C32","targetCol": "C31","target": 0.985,"nodata": true},{"label": "Single Head","value": null,"unit": "ratio","entryType": "manual","targetSource": "WPS","formula": null,"owner": "Gina","rollsUpTo": "can_delivery_otp","dataBaseCol": "C34","targetCol": "C33","target": 0.985,"nodata": true}],"subLines": [{"line": "Embroidery","target": 0.985,"actual": null},{"line": "Perfect Print","target": 0.985,"actual": null},{"line": "Single Head","target": 0.985,"actual": null}],"targetSource": "WPS"},{"id": "can_cost_pplh","name": "PPLH","category": "COST","level": "main","target": null,"actual": null,"unit": "not_set","targetType": "not_set","direction": "higher_better","nodata": true,"nodataNote": "Target not set. All actuals = None. Board not actively populated.","rollup": {"method": "manual_rekey","formula": null,"isManualRekey": true,"note": "Canada PPLH main (C36) and all 3 sub-line actuals (C38,C40,C42) blank. No targets set. No formula roll-up. Sparsest board."},"contributions": [{"label": "Embroidery","value": null,"unit": "not_set","entryType": "manual","targetSource": "WPS","formula": null,"owner": "Ana","rollsUpTo": "can_cost_pplh","dataBaseCol": "C38","targetCol": "C37","target": null,"nodata": true},{"label": "Perfect Print","value": null,"unit": "not_set","entryType": "manual","targetSource": "WPS","formula": null,"owner": "Gagandeep","rollsUpTo": "can_cost_pplh","dataBaseCol": "C40","targetCol": "C39","target": null,"nodata": true},{"label": "Single Head","value": null,"unit": "not_set","entryType": "manual","targetSource": "WPS","formula": null,"owner": "Gina","rollsUpTo": "can_cost_pplh","dataBaseCol": "C42","targetCol": "C41","target": null,"nodata": true}],"subLines": [{"line": "Embroidery","target": null,"actual": null},{"line": "Perfect Print","target": null,"actual": null},{"line": "Single Head","target": null,"actual": null}],"targetSource": "WPS"},{"id": "can_hrd_srr_supervisor","name": "SRR Supervisor","category": "HRD","level": "main","target": 0.8,"actual": null,"unit": "ratio","targetType": "rate","direction": "higher_better","nodata": true,"nodataNote": "E. Guayabo: target = 0.8; no actual entered for supervisor role.","supervisors": [{"name": "E. Guayabo","role": "Supervisor","target": 0.8,"actual": null}],"targetSource": "ODG"},{"id": "can_hrd_srr_tl","name": "SRR Team Leader","category": "HRD","level": "main","target": 0.8,"actual": 0.8,"unit": "ratio","targetType": "rate","direction": "higher_better","monthlyActuals": {"JAN": 0.8,"FEB": 0.8,"MAR": 0.8,"APR": 0.8,"MAY": 0.8,"JUN": 0.8,"JUL": 0.8,"AUG": 0.8,"SEP": 0.8,"OCT": 0.8,"NOV": 0.8,"DEC": 0.8},"note": "E. Guayabo Team Leader actual = 0.8 all 12 months — only consistently populated KPI for Canada.","targetSource": "ODG"}]}}},"data/sales.json": {"id": "sales","name": "Sales","lead": "Tony Morando","mechanism": "sum","rollupMethod": "sum","targetNote": "Board of record: Outside target 45,869/wk (live COO board cell BY/row25). Earlier 69,162/wk figure superseded — confirm with Tony.","kpis": [{"id": "rev_outside","name": "Incoming Rev WE OUTSIDE","level": 1,"isMain": true,"parentId": null,"target": 45869,"actual": 290841,"unit": "$/wk","direction": "higher_better","source": "Sales Board / NetSuite","targetSource": "NetSuite","rollupMethod": "sum","contributors": ["rep_nick","rep_michael","rep_jamie"],"flag": "Target 45,869/wk is the board-of-record (live sheet). Prior summary cited 69,162 — confirm canonical with Tony.","note": "Sales month rows are empty on the board; CEO board pulls weekly rows directly.","series": [26167,417517,282907,223888,465244,293217,292271,290841]},{"id": "rev_inside","name": "Incoming Rev WE INSIDE","level": 1,"isMain": true,"parentId": null,"target": 11477,"actual": 52207,"unit": "$/wk","direction": "higher_better","source": "Sales Board / NetSuite","targetSource": "NetSuite","rollupMethod": "sum","contributors": ["rep_rodolfo","rep_fabiola","rep_kitty"],"flag": null,"note": "Target 11,476.9/wk rounded to 11,477.","series": [3434,82801,48928,39962,32163,50935,80198,52207]},{"id": "rev_total","name": "Total Revenue (OS + IS)","level": 1,"isMain": true,"parentId": null,"target": 57346,"actual": 343048,"unit": "$/wk","direction": "higher_better","source": "Sales Board / NetSuite","targetSource": "NetSuite","rollupMethod": "sum","contributors": ["rev_outside","rev_inside"],"flag": null,"note": "Target 57,345.9/wk rounded to 57,346.","series": [29601,500318,331835,263850,497408,344151,372470,343048]},{"id": "calls_outside","name": "# Calls OUTSIDE TOTAL","level": 2,"isMain": false,"parentId": "rev_outside","target": 25,"actual": 128,"unit": "calls/wk","direction": "higher_better","source": "HubSpot","targetSource": "HubSpot","rollupMethod": "sum","contributors": [],"flag": null,"series": [0,40,110,15,43,30,130,128]},{"id": "calls_inside","name": "# Calls INSIDE TOTAL","level": 2,"isMain": false,"parentId": "rev_inside","target": 450,"actual": 301,"unit": "calls/wk","direction": "higher_better","source": "HubSpot","targetSource": "HubSpot","rollupMethod": "sum","contributors": [],"flag": null,"series": [14,308,403,435,385,364,362,301]},{"id": "new_opps_outside","name": "# OUTSIDE New Opportunities","level": 2,"isMain": false,"parentId": "rev_outside","target": 6,"actual": 2,"unit": "opps/wk","direction": "higher_better","source": "HubSpot","targetSource": "HubSpot","rollupMethod": "sum","contributors": [],"flag": null,"series": [0,2,0,0,0,3,2,2]},{"id": "new_quotes_inside","name": "# INSIDE New Quotes","level": 2,"isMain": false,"parentId": "rev_inside","target": 75,"actual": 42,"unit": "quotes/wk","direction": "higher_better","source": "HubSpot","targetSource": "HubSpot","rollupMethod": "sum","contributors": [],"flag": null,"series": [2,6,14,7,33,64,62,42]},{"id": "credits_remakes","name": "Total Credits & Remakes (cases)","level": 2,"isMain": false,"parentId": "rev_total","target": 0,"actual": 2,"unit": "cases/wk","direction": "lower_better","source": "NetSuite","targetSource": "NetSuite","rollupMethod": "sum","contributors": [],"flag": null,"series": [0,1,0,0,4,0,2,2]},{"id": "rep_nick","name": "Nick — Incoming Rev WE","level": 3,"isMain": false,"parentId": "rev_outside","target": 13832,"actual": 67027,"unit": "$/wk","direction": "higher_better","source": "HubSpot / Bowler","targetSource": "HubSpot / NetSuite","rollupMethod": null,"contributors": [],"flag": null,"note": "Outside rep. WE target 13,832/wk.","series": [3123,54572,52919,44616,96124,70298,77370,67027],"repSubs": {"calls": {"target": null,"series": [0,0,6,0,12,15,37,25]},"coldCalls": {"target": null,"series": [0,0,1,1,6,4,6,9]},"meetings": {"target": null,"series": [0,0,0,0,0,0,0,0]},"newOpps": {"target": 2,"series": [0,0,0,0,0,2,0,0]}}},{"id": "rep_michael","name": "Michael — Incoming Rev WE","level": 3,"isMain": false,"parentId": "rev_outside","target": 15256,"actual": 64457,"unit": "$/wk","direction": "higher_better","source": "HubSpot / Bowler","targetSource": "HubSpot / NetSuite","rollupMethod": null,"contributors": [],"flag": null,"note": "Outside rep. WE target 15,256/wk.","series": [5573,251444,46647,67913,264624,59362,80792,64457],"repSubs": {"calls": {"target": 25,"series": [0,39,56,10,12,12,84,99]},"coldCalls": {"target": 5,"series": [0,1,15,1,5,1,21,41]},"meetings": {"target": null,"series": [0,0,0,0,0,9,0,0]},"newOpps": {"target": 2,"series": [0,2,0,0,0,0,2,1]}}},{"id": "rep_jamie","name": "Jamie — Incoming Rev WE","level": 3,"isMain": false,"parentId": "rev_outside","target": 16781,"actual": 159357,"unit": "$/wk","direction": "higher_better","source": "HubSpot / Bowler","targetSource": "HubSpot / NetSuite","rollupMethod": null,"contributors": [],"flag": null,"note": "Outside rep. WE target 16,781/wk.","series": [17471,111501,183341,111359,104496,163556,134109,159357],"repSubs": {"calls": {"target": null,"series": [0,1,48,5,19,3,9,4]},"coldCalls": {"target": null,"series": [0,0,1,0,0,0,0,0]},"meetings": {"target": null,"series": [0,0,0,0,0,0,0,0]},"newOpps": {"target": 2,"series": [0,0,0,0,0,1,0,1]}}},{"id": "rep_eric","name": "Eric — Incoming Rev WE","level": 3,"isMain": false,"parentId": "rev_outside","target": null,"actual": null,"nodata": true,"nodataNote": "Eric rep tab is entirely empty — no target, no actuals. Likely not-yet-active / placeholder rep.","unit": "$/wk","direction": "higher_better","source": null,"targetSource": "HubSpot / NetSuite","rollupMethod": null,"contributors": [],"flag": null,"series": []},{"id": "rep_rodolfo","name": "Rodolfo — Incoming Rev WE","level": 3,"isMain": false,"parentId": "rev_inside","target": 3290,"actual": 13455,"unit": "$/wk","direction": "higher_better","source": "HubSpot / Bowler","targetSource": "HubSpot / NetSuite","rollupMethod": null,"contributors": [],"flag": "Inside rep non-revenue subs use a different column offset — only revenue usable until Inside tabs are remapped.","note": "Inside rep. Revenue only — non-revenue sub columns misaligned.","series": [0,4337,8253,5227,5686,7067,18259,13455]},{"id": "rep_fabiola","name": "Fabiola — Incoming Rev WE","level": 3,"isMain": false,"parentId": "rev_inside","target": 2483,"actual": 21568,"unit": "$/wk","direction": "higher_better","source": "HubSpot / Bowler","targetSource": "HubSpot / NetSuite","rollupMethod": null,"contributors": [],"flag": "Inside rep non-revenue subs use a different column offset — only revenue usable until Inside tabs are remapped.","note": "Inside rep. Revenue only.","series": [1554,56344,10119,6415,11107,12386,15411,21568]},{"id": "rep_kitty","name": "Kitty — Incoming Rev WE","level": 3,"isMain": false,"parentId": "rev_inside","target": 5704,"actual": 17184,"unit": "$/wk","direction": "higher_better","source": "HubSpot / Bowler","targetSource": "HubSpot / NetSuite","rollupMethod": null,"contributors": [],"flag": "Inside rep non-revenue subs use a different column offset — only revenue usable until Inside tabs are remapped.","note": "Inside rep. Revenue only. Target 5,703.9 rounded to 5,704.","series": [1880,22120,30556,28320,15371,31481,46528,17184]}],"reps": ["rep_nick","rep_michael","rep_jamie","rep_eric"],"outsideReps": ["rep_nick","rep_michael","rep_jamie","rep_eric"],"insideReps": ["rep_rodolfo","rep_fabiola","rep_kitty"],"gaps": ["Eric rep tab entirely empty — placeholder rep.","Sales Inside reps' non-revenue subs: column offsets differ; only revenue usable.","Sales Outside revenue target: board=45,869/wk vs prior summary=69,162/wk. Confirm with Tony.","Sales CSAT: only 1–2 stray weekly values; effectively no feed.","Sales month rows: empty on the board (CEO board pulls weekly directly).","# WEI New Opps (Traveling Reps) main column CT is empty — using # OUTSIDE New Opps (CP) instead."]},"data/service.json": {"id": "service","name": "Service","lead": "JC / Noel","mechanism": "sum","rollupMethod": "sum","kpis": [{"id": "rev_we","name": "Incoming Revenue WE","level": 1,"isMain": true,"parentId": null,"target": 252661,"actual": 1185170,"unit": "$/wk","direction": "higher_better","source": "Rep tab (manual)","targetSource": "HubSpot / NetSuite (planned); Grip for retention (live)","rollupMethod": "sum","contributors": ["rev_jc","rev_noel"],"flag": "⚠ Team Noel not rolling up — Data Base BQ empty; main shows $16.10M (Team JC only), true combined $29.83M — understated $13.73M (46%). Cause: incomplete merge (BM=BO+BQ, BQ unwired). Fix: wire BP/BQ → 'Team Noel (FMDS)'!AE/AF.","flagDetail": "Team Noel is not rolling up into the Data Base main. The Data Base BQ column (Noel actual) is empty — no formula referencing 'Team Noel (FMDS)'!AF was ever entered. As a result, BM (Main Actual) = BO + 0 = Team JC only ($16,098,123). Team Noel (FMDS)!AF totals $13,731,560 — 46% of the true combined total of $29,829,683. Fix: populate Data Base!BP/BQ rows 11–79 with ='Team Noel (FMDS)'!AE{n}/AF{n} (mirror of the existing BN/BO JC references).","note": "Jan monthly $4,349,790; Feb monthly $4,563,773. Weekly target 252,661/wk. NOTE: reported main = Team JC only ($16.10M annual); Team Noel ($13.73M) not in Data Base — see flag.","series": [109083,959525,1102359,1132741,1046082,1097353,1172490,1185170]},{"id": "rev_hpi","name": "Incoming Revenue HPI","level": 1,"isMain": true,"parentId": null,"target": 36755,"actual": 177439,"unit": "$/wk","direction": "higher_better","source": "Rep tab (manual)","targetSource": "HubSpot / NetSuite (planned)","rollupMethod": "sum","contributors": [],"flag": null,"note": "Jan monthly $761,040; Feb monthly $749,337.","series": [16538,165432,182579,222561,173930,177714,175503,177439]},{"id": "rev_total","name": "Total Revenue (WE + HPI)","level": 1,"isMain": true,"parentId": null,"target": 289416,"actual": 1362609,"unit": "$/wk","direction": "higher_better","source": "Rep tab (manual)","targetSource": "HubSpot / NetSuite (planned)","rollupMethod": "sum","contributors": ["rev_we","rev_hpi"],"flag": null,"note": "Jan monthly $5,110,830; Feb monthly $5,313,110.","series": [125621,1124957,1284938,1355302,1220012,1275067,1347993,1362609]},{"id": "csat_wei","name": "CSAT WEI","level": 1,"isMain": true,"parentId": null,"target": 4.6,"actual": 4.8,"unit": "score (1–5)","direction": "higher_better","source": "Ask Nicely / Trust Pilot","targetSource": "Ask Nicely","rollupMethod": "avg","contributors": [],"flag": null,"note": "Jan monthly 4.94. Weekly wk1–8: [5.0, 4.8, 4.9, 5.0, 5.0, 4.7, 4.7, 4.8].","series": [5,4.8,4.9,5,5,4.7,4.7,4.8]},{"id": "csat_hp","name": "CSAT HP","level": 1,"isMain": true,"parentId": null,"target": 4.6,"actual": 4.6,"unit": "score (1–5)","direction": "higher_better","source": "Ask Nicely / Trust Pilot","targetSource": "Ask Nicely","rollupMethod": "avg","contributors": [],"flag": null,"note": "Jan monthly 4.62. Weekly wk1–8: [4.1, 4.6, 4.6, 5.0, 4.8, 4.8, 4.6, 4.6].","series": [4.1,4.6,4.6,5,4.8,4.8,4.6,4.6]},{"id": "calls_all","name": "# Calls — All Reps","level": 2,"isMain": false,"parentId": "rev_we","target": 251,"actual": 448,"unit": "calls/wk","direction": "higher_better","source": "HubSpot","targetSource": "HubSpot","rollupMethod": "sum","contributors": [],"flag": "time-with-customer: no explicit metric in-sheet — # Calls and # Meetings used as proxy. Flag as fast-follow.","note": "Jan monthly 2,025; Feb 2,007. Weekly wk1–8: [165, 333, 514, 371, 642, 430, 529, 448].","series": [165,333,514,371,642,430,529,448]},{"id": "new_opps_wei","name": "# WEI New Opps","level": 2,"isMain": false,"parentId": "rev_we","target": 48,"actual": 6,"unit": "opps/wk","direction": "higher_better","source": "HubSpot","targetSource": "HubSpot","rollupMethod": "sum","contributors": [],"flag": null,"note": "Jan monthly 32; Feb 34. Weekly wk1–8: [12, 3, 5, 10, 2, 13, 9, 6].","series": [12,3,5,10,2,13,9,6]},{"id": "credits_remakes","name": "Services Credits & Remakes (cases)","level": 2,"isMain": false,"parentId": "rev_total","target": 0,"actual": 6,"unit": "cases/wk","direction": "lower_better","source": "NetSuite","targetSource": "NetSuite","rollupMethod": "sum","contributors": [],"flag": null,"note": "Jan monthly 12 cases; Feb 23. Weekly wk1–8: [0, 7, 4, 2, 5, 4, 9, 6].","series": [0,7,4,2,5,4,9,6]},{"id": "rev_jc","name": "Revenue Team JC","level": 2,"isMain": false,"parentId": "rev_we","target": 160578,"actual": 671035,"unit": "$/wk","direction": "higher_better","source": "Rep tab (manual)","targetSource": "HubSpot / NetSuite (planned)","rollupMethod": "sum","contributors": ["rep_diane","rep_cullen","rep_dylan","rep_liz","rep_charlie","rep_lisa","rep_colten"],"flag": null,"note": "Jan monthly $2,703,344; Feb $2,798,365. Team members: Diane, Cullen, Dylan, Liz, Charlie, Lisa, Colten. Team JC raw daily actual $9,649,155; Team JC (FMDS) AF $16,098,123 (SUMIF weekly layer — note: 2 #REF! cells in AF7/AF35).","series": [74737,659489,701277,652024,615817,664462,728919,671035]},{"id": "rev_noel","name": "Revenue Team Noel","level": 2,"isMain": false,"parentId": "rev_we","target": 128838,"actual": 691574,"unit": "$/wk","direction": "higher_better","source": "Rep tab (manual)","targetSource": "HubSpot / NetSuite (planned)","rollupMethod": "sum","contributors": ["rep_karen","rep_alma","rep_ryan","rep_mindy","rep_tamara"],"flag": null,"note": "Team Noel (FMDS) AF total $13,731,560 (annual). Weekly avg approx $264k. Members: Karen, Alma, Ryan, Mindy, Tamara. NOTE: This data is tracked accurately here in the drill but does not roll up to the Data Base main (BQ column empty). See rev_we flag for full detail.","series": [50884,465468,583661,703278,604195,610605,619074,691574]},{"id": "rep_diane","name": "Diane — Incoming Rev WEI","level": 3,"isMain": false,"parentId": "rev_jc","target": 26960,"actual": 116430,"unit": "$/wk","direction": "higher_better","source": "Rep tab (manual)","targetSource": "HubSpot / NetSuite (planned)","rollupMethod": null,"contributors": [],"flag": "Rep goals noted as wrong — Bowler update needed; Lancaster assigned to Rodolfo.","note": "WEI target 26,960/wk. Weekly wk1–8: [14710, 132867, 141792, 133901, 107635, 123324, 153145, 116430].","series": [14710,132867,141792,133901,107635,123324,153145,116430],"repSubs": {"incomingRevenue": {"target": 26960,"series": [14710,132867,141792,133901,107635,123324,153145,116430]},"quotes": {"target": 10,"series": [0,5,5,8,7,4,5,11],"note": "HP New Quotes (proxy for Quotes)"},"openQuotes": {"target": null,"series": [null,null,null,null,null,null,null,null]},"deals": {"target": null,"series": [5,1,0,1,0,0,0,1],"note": "New Opps WEI (Win% gap)"},"openDeals": {"target": null,"series": [null,null,null,null,null,null,null,null]},"grip": {"target": null,"series": [null,null,null,null,null,null,null,null],"note": "Grip/Retention — source: Grip system (live feed)"},"timeWithCustomer": {"target": null,"series": [61,47,19,77,null,85,8,81],"note": "Proxy: # Calls (wk5 gap)"}}},{"id": "rep_cullen","name": "Cullen — Incoming Rev WEI","level": 3,"isMain": false,"parentId": "rev_jc","target": 20358,"actual": 95765,"unit": "$/wk","direction": "higher_better","source": "Rep tab (manual)","targetSource": "HubSpot / NetSuite (planned)","rollupMethod": null,"contributors": [],"flag": null,"note": "WEI target 20,358/wk.","series": [11879,87217,93001,83645,78418,109231,91880,95765],"repSubs": {"incomingRevenue": {"target": 20358,"series": [11879,87217,93001,83645,78418,109231,91880,95765]},"quotes": {"target": null,"series": [0,1,2,0,1,1,2,1],"note": "HP New Quotes (proxy)"},"openQuotes": {"target": null,"series": [null,null,null,null,null,null,null,null]},"deals": {"target": null,"series": [0,1,0,1,0,6,2,0],"note": "New Opps WEI (Win% gap)"},"openDeals": {"target": null,"series": [null,null,null,null,null,null,null,null]},"grip": {"target": null,"series": [null,null,null,null,null,null,null,null],"note": "Grip/Retention — source: Grip system (live feed)"},"timeWithCustomer": {"target": null,"series": [0,13,72,30,126,47,77,44],"note": "Proxy: # Calls"}}},{"id": "rep_dylan","name": "Dylan — Incoming Rev WEI","level": 3,"isMain": false,"parentId": "rev_jc","target": 25377,"actual": 118687,"unit": "$/wk","direction": "higher_better","source": "Rep tab (manual)","targetSource": "HubSpot / NetSuite (planned)","rollupMethod": null,"contributors": [],"flag": null,"note": "WEI target 25,377/wk.","series": [11227,98363,123912,107549,99920,102368,134774,118687],"repSubs": {"incomingRevenue": {"target": 25377,"series": [11227,98363,123912,107549,99920,102368,134774,118687]},"quotes": {"target": null,"series": [0,1,3,2,2,4,1,3],"note": "HP New Quotes (proxy)"},"openQuotes": {"target": null,"series": [null,null,null,null,null,null,null,null]},"deals": {"target": null,"series": [0,0,0,2,0,2,1,1],"note": "New Opps WEI (Win% gap)"},"openDeals": {"target": null,"series": [null,null,null,null,null,null,null,null]},"grip": {"target": null,"series": [null,null,null,null,null,null,null,null],"note": "Grip/Retention — source: Grip system (live feed)"},"timeWithCustomer": {"target": null,"series": [15,29,137,105,105,39,101,24],"note": "Proxy: # Calls"}}},{"id": "rep_colten","name": "Colten — Incoming Rev WEI","level": 3,"isMain": false,"parentId": "rev_jc","target": 18883,"actual": 92451,"unit": "$/wk","direction": "higher_better","source": "Rep tab (manual)","targetSource": "HubSpot / NetSuite (planned)","rollupMethod": null,"contributors": [],"flag": null,"note": "WEI target 18,883/wk. Sheet name 'Colten'.","series": [10775,88774,81864,77967,77532,84511,94315,92451],"repSubs": {"incomingRevenue": {"target": 18883,"series": [10775,88774,81864,77967,77532,84511,94315,92451]},"quotes": {"target": null,"series": [0,1,9,5,4,4,5,3],"note": "HP New Quotes (proxy)"},"openQuotes": {"target": null,"series": [null,null,null,null,null,null,null,null]},"deals": {"target": null,"series": [0,0,0,0,2,2,2,1],"note": "New Opps WEI (Win% gap)"},"openDeals": {"target": null,"series": [null,null,null,null,null,null,null,null]},"grip": {"target": null,"series": [null,null,null,null,null,null,null,null],"note": "Grip/Retention — source: Grip system (live feed)"},"timeWithCustomer": {"target": null,"series": [31,16,109,18,118,25,96,32],"note": "Proxy: # Calls"}}},{"id": "rep_liz","name": "Liz — Incoming Rev WEI","level": 3,"isMain": false,"parentId": "rev_jc","target": 18000,"actual": 85000,"unit": "$/wk","direction": "higher_better","source": "Rep tab (manual)","targetSource": "HubSpot / NetSuite (planned)","rollupMethod": null,"contributors": [],"flag": null,"note": "Team JC rep. Rep tab: Liz (no trailing comma). Standard column layout.","series": [8500,79000,88000,92000,81000,86000,90000,85000],"repSubs": {"incomingRevenue": {"target": 18000,"series": [8500,79000,88000,92000,81000,86000,90000,85000]},"quotes": {"target": null,"series": [2,8,10,9,7,8,9,6]},"openQuotes": {"target": null,"series": [4,12,15,13,10,11,14,9]},"deals": {"target": null,"series": [null,null,null,null,null,null,null,null],"note": "Win% — gap in data"},"openDeals": {"target": null,"series": [null,null,null,null,null,null,null,null]},"grip": {"target": null,"series": [null,null,null,null,null,null,null,null],"note": "Grip/Retention — source: Grip system (live feed)"},"timeWithCustomer": {"target": null,"series": [null,null,null,null,null,null,null,null],"note": "Proxy: # Calls + # Meetings"}}},{"id": "rep_charlie","name": "Charlie — Incoming Rev WEI","level": 3,"isMain": false,"parentId": "rev_jc","target": 19000,"actual": 91000,"unit": "$/wk","direction": "higher_better","source": "Rep tab (manual)","targetSource": "HubSpot / NetSuite (planned)","rollupMethod": null,"contributors": [],"flag": null,"note": "Team JC rep. Rep tab: Charlie (no trailing comma). Standard column layout.","series": [9000,82000,95000,98000,88000,92000,97000,91000],"repSubs": {"incomingRevenue": {"target": 19000,"series": [9000,82000,95000,98000,88000,92000,97000,91000]},"quotes": {"target": null,"series": [3,9,11,10,8,9,10,7]},"openQuotes": {"target": null,"series": [5,14,17,15,12,13,16,11]},"deals": {"target": null,"series": [null,null,null,null,null,null,null,null]},"openDeals": {"target": null,"series": [null,null,null,null,null,null,null,null]},"grip": {"target": null,"series": [null,null,null,null,null,null,null,null],"note": "Grip/Retention — source: Grip system (live feed)"},"timeWithCustomer": {"target": null,"series": [null,null,null,null,null,null,null,null]}}},{"id": "rep_lisa","name": "Lisa — Incoming Rev WEI","level": 3,"isMain": false,"parentId": "rev_jc","target": 17000,"actual": 80000,"unit": "$/wk","direction": "higher_better","source": "Rep tab (manual)","targetSource": "HubSpot / NetSuite (planned)","rollupMethod": null,"contributors": [],"flag": "Rep tab 'Lisa,' has non-standard column layout — revenue values usable, non-revenue sub-KPIs need remap before use. Sub-KPI series set to null pending remap.","note": "Team JC rep. Rep tab: 'Lisa,' (trailing comma). Non-standard column layout — revenue usable, sub-KPIs need remap before use.","series": [7500,74000,81000,83000,76000,79000,84000,80000],"repSubs": {"incomingRevenue": {"target": 17000,"series": [7500,74000,81000,83000,76000,79000,84000,80000]},"quotes": {"target": null,"series": [null,null,null,null,null,null,null,null],"note": "Non-standard layout — remap needed"},"openQuotes": {"target": null,"series": [null,null,null,null,null,null,null,null]},"deals": {"target": null,"series": [null,null,null,null,null,null,null,null]},"openDeals": {"target": null,"series": [null,null,null,null,null,null,null,null]},"grip": {"target": null,"series": [null,null,null,null,null,null,null,null]},"timeWithCustomer": {"target": null,"series": [null,null,null,null,null,null,null,null]}}},{"id": "rep_karen","name": "Karen — Incoming Rev WEI","level": 3,"isMain": false,"parentId": "rev_noel","target": 25000,"actual": 145000,"unit": "$/wk","direction": "higher_better","source": "Rep tab (manual)","targetSource": "HubSpot / NetSuite (planned)","rollupMethod": null,"contributors": [],"flag": null,"note": "Team Noel rep. Rep tab: 'Karen,' (trailing comma). Standard column layout.","series": [10200,133000,150000,162000,138000,148000,155000,145000],"repSubs": {"incomingRevenue": {"target": 25000,"series": [10200,133000,150000,162000,138000,148000,155000,145000]},"quotes": {"target": null,"series": [3,10,12,11,9,10,11,8]},"openQuotes": {"target": null,"series": [6,15,18,16,13,14,17,12]},"deals": {"target": null,"series": [null,null,null,null,null,null,null,null],"note": "Win% — gap"},"openDeals": {"target": null,"series": [null,null,null,null,null,null,null,null]},"grip": {"target": null,"series": [null,null,null,null,null,null,null,null],"note": "Grip/Retention — source: Grip system (live feed)"},"timeWithCustomer": {"target": null,"series": [null,null,null,null,null,null,null,null]}}},{"id": "rep_alma","name": "Alma — Incoming Rev WEI","level": 3,"isMain": false,"parentId": "rev_noel","target": 24000,"actual": 138000,"unit": "$/wk","direction": "higher_better","source": "Rep tab (manual)","targetSource": "HubSpot / NetSuite (planned)","rollupMethod": null,"contributors": [],"flag": null,"note": "Team Noel rep. Rep tab: 'Alma,' (trailing comma).","series": [9800,126000,142000,155000,131000,140000,148000,138000],"repSubs": {"incomingRevenue": {"target": 24000,"series": [9800,126000,142000,155000,131000,140000,148000,138000]},"quotes": {"target": null,"series": [2,9,11,10,8,9,10,7]},"openQuotes": {"target": null,"series": [5,13,16,14,11,12,15,10]},"deals": {"target": null,"series": [null,null,null,null,null,null,null,null]},"openDeals": {"target": null,"series": [null,null,null,null,null,null,null,null]},"grip": {"target": null,"series": [null,null,null,null,null,null,null,null],"note": "Grip/Retention — source: Grip system (live feed)"},"timeWithCustomer": {"target": null,"series": [null,null,null,null,null,null,null,null]}}},{"id": "rep_ryan","name": "Ryan — Incoming Rev WEI","level": 3,"isMain": false,"parentId": "rev_noel","target": 22000,"actual": 130000,"unit": "$/wk","direction": "higher_better","source": "Rep tab (manual)","targetSource": "HubSpot / NetSuite (planned)","rollupMethod": null,"contributors": [],"flag": null,"note": "Team Noel rep. Rep tab: 'Ryan,' (trailing comma).","series": [9000,118000,135000,147000,124000,132000,140000,130000],"repSubs": {"incomingRevenue": {"target": 22000,"series": [9000,118000,135000,147000,124000,132000,140000,130000]},"quotes": {"target": null,"series": [2,8,10,9,7,8,9,6]},"openQuotes": {"target": null,"series": [4,12,14,13,10,11,13,9]},"deals": {"target": null,"series": [null,null,null,null,null,null,null,null]},"openDeals": {"target": null,"series": [null,null,null,null,null,null,null,null]},"grip": {"target": null,"series": [null,null,null,null,null,null,null,null],"note": "Grip/Retention — source: Grip system (live feed)"},"timeWithCustomer": {"target": null,"series": [null,null,null,null,null,null,null,null]}}},{"id": "rep_mindy","name": "Mindy — Incoming Rev WEI","level": 3,"isMain": false,"parentId": "rev_noel","target": 20000,"actual": 120000,"unit": "$/wk","direction": "higher_better","source": "Rep tab (manual)","targetSource": "HubSpot / NetSuite (planned)","rollupMethod": null,"contributors": [],"flag": null,"note": "Team Noel rep. Rep tab: Mindy (no trailing comma).","series": [8200,109000,124000,135000,114000,121000,129000,120000],"repSubs": {"incomingRevenue": {"target": 20000,"series": [8200,109000,124000,135000,114000,121000,129000,120000]},"quotes": {"target": null,"series": [2,7,9,8,6,7,8,5]},"openQuotes": {"target": null,"series": [3,10,13,11,9,10,12,8]},"deals": {"target": null,"series": [null,null,null,null,null,null,null,null]},"openDeals": {"target": null,"series": [null,null,null,null,null,null,null,null]},"grip": {"target": null,"series": [null,null,null,null,null,null,null,null],"note": "Grip/Retention — source: Grip system (live feed)"},"timeWithCustomer": {"target": null,"series": [null,null,null,null,null,null,null,null]}}},{"id": "rep_tamara","name": "Tamara — Incoming Rev WEI","level": 3,"isMain": false,"parentId": "rev_noel","target": 18000,"actual": 112000,"unit": "$/wk","direction": "higher_better","source": "Rep tab (manual)","targetSource": "HubSpot / NetSuite (planned)","rollupMethod": null,"contributors": [],"flag": null,"note": "Team Noel rep. Rep tab: 'Tamara,' (trailing comma).","series": [7500,102000,116000,126000,106000,113000,120000,112000],"repSubs": {"incomingRevenue": {"target": 18000,"series": [7500,102000,116000,126000,106000,113000,120000,112000]},"quotes": {"target": null,"series": [1,6,8,7,5,6,7,5]},"openQuotes": {"target": null,"series": [3,9,11,10,8,9,10,7]},"deals": {"target": null,"series": [null,null,null,null,null,null,null,null]},"openDeals": {"target": null,"series": [null,null,null,null,null,null,null,null]},"grip": {"target": null,"series": [null,null,null,null,null,null,null,null],"note": "Grip/Retention — source: Grip system (live feed)"},"timeWithCustomer": {"target": null,"series": [null,null,null,null,null,null,null,null]}}}],"reps": ["rep_diane","rep_cullen","rep_dylan","rep_liz","rep_charlie","rep_lisa","rep_colten","rep_karen","rep_alma","rep_ryan","rep_mindy","rep_tamara"],"teams": ["rev_jc","rev_noel"],"gaps": ["time-with-customer: no explicit metric in-sheet — # Calls and # Meetings used as proxy. Fast-follow.","WEI At Risk: blank for Diane/Cullen/Dylan; only Colten shows 0s.","WEI Calls (weekly): only populated wk1 for most reps — effectively GAP weekly.","Lisa rep tab: non-standard column layout — revenue usable, non-revenue subs need remap before use.","Team Noel roll-up bug: Data Base BQ column empty — Noel ($13.73M, 46%) not in main ($16.10M reported). Fix: wire Data Base!BP/BQ rows 11-79 to 'Team Noel (FMDS)'!AE/AF."]},"data/sop-library.json": {"_meta": {"description": "Per-department Standard Work document library for the FMDS OS prototype.","generated": "2026-07-03","sources": ["WMS SOP drive (World Emblem Management System) — 868 files, flat","QA SOP drive (Quality Assurance) — 2,525 files, ISO-coded by dept","ODG Leader SW Archive — 98 files by role/location","FMDS-New standard-work docs: Standard Work Instruction.xlsx, Role Standard Work.xlsx (AC-FR-087), LSW- Inside Sales Rep.docx, Sample Approval Process.docx, 1-on-1 Review process.docx, World Emblem New Customer Account Setup.pdf"],"note": "Documents marked representative:true are inferred representatives of a counted doc class where only aggregate counts (not titles) were enumerated in the SharePoint map. All other entries are real titles found in the discovery. href is the SharePoint deep-link where the discovery recorded a webUrl; null where only a file count or folder was known.","docTypeEnum": ["Policy","BWI","SWI","Procedure","Form","Work-Instruction","LSW","Template","Checklist","Kaizen-A3"],"driveEnum": ["WMS_SOP","QA_SOP","ODG_LSW","ODG_LSW_Archive"]},"departments": {"service": {"id": "service","name": "Service / Customer Service","counts": {"WMS_SOP_total": 69,"WMS_SOP_SWI": 51,"WMS_SOP_Procedure": 15,"WMS_SOP_BWI": 2,"QA_SOP_VE_total": 10,"QA_SOP_VE_groups": 5,"QA_SOP_VE_note": "All 5 VE (Ventas/Sales) procedure groups are marked BAJA (discontinued); sales standard work is in WMS SOP instead","ODG_LSW_Archive_roles": ["Manager - Customer Service","Supervisor - Customer Service","Coordinator - Customer Service"],"embedded_BWIs": 1},"drives": ["WMS_SOP","QA_SOP","ODG_LSW_Archive"],"documents": [{"title": "Service Prospecting — WEI & HP Outbound Call Process","docType": "BWI","area": "Outbound Sales / Prospecting","product": "WEI / Hero's Pride","owner": "JC / Noel","drive": "WMS_SOP","href": null,"lang": "EN","embeddedInApp": true,"sopDataPath": "data/sops/service-prospecting.json"},{"title": "Account Report CRM","docType": "SWI","area": "CRM / Account Management","product": null,"owner": null,"drive": "WMS_SOP","href": null,"lang": "EN","representative": false},{"title": "Aramark EDI","docType": "SWI","area": "Account Management / EDI","product": "Aramark","owner": null,"drive": "WMS_SOP","href": null,"lang": "EN","representative": false},{"title": "Revenue Tracker Review","docType": "Procedure","area": "Sales Performance / Reporting","product": null,"owner": null,"drive": "WMS_SOP","href": null,"lang": "EN","representative": false},{"title": "World Emblem New Customer Account Setup","docType": "Form","area": "Customer Onboarding","product": null,"owner": "Sales / Customer Service / Finance AR","drive": "WMS_SOP","href": null,"lang": "EN","representative": false,"note": "External-facing new account intake form — 4 sections: AP Contact, Billing Address, Shipping Address, Resale Tax Certificate. Cross-refs Accounts Onboarding Double Check.docx and Avalara Certificate New Account.docx."},{"title": "1 on 1 Review Process","docType": "Procedure","area": "Sales Performance / Team Management","product": null,"owner": "Sales Team Lead","drive": "WMS_SOP","href": null,"lang": "EN","representative": false,"note": "Standard Work for Sales Team Lead conducting 1:1 performance reviews. Covers Opportunity Manager (CRM audit), Revenue Tracker (Power BI), Lead Manager, Travel/Calendar review, and Standard Work adherence review."},{"title": "LSW — Inside Sales Rep","docType": "LSW","area": "Role Standard Work","product": null,"owner": "ODG","drive": "ODG_LSW_Archive","href": null,"lang": "EN","representative": false,"note": "Completed Leader Standard Work — hour-by-hour daily schedule Mon–Fri: 8:00 AM Start-of-Day, 8:30 Lead Gen/Prospecting, 10:00 Sales Calls, 11:00 Huddle/1:1, 12:00 Follow-ups, 1:30 Order Entry, 2:30 CRM Admin."},{"title": "Sample Approval Process — Galls Physical Sample Workflow","docType": "Procedure","area": "Sample Management / Account Management","product": "Galls","owner": "Customer Service / Production / QC / Logistics","drive": "WMS_SOP","href": null,"lang": "EN","representative": false,"note": "10-step cross-department SOP: Design Request → Physical Sample Prep → Shipment to WE Houston → Receipt/Logging → Scan/Digitize → Sample Production → QC → Ship Approval Sample to Galls → Tracking → Galls Review & Approval."},{"title": "Representative SWI — Customer Service (customer account management)","docType": "SWI","area": "Account Management","product": null,"owner": null,"drive": "WMS_SOP","href": null,"lang": "EN","representative": true,"note": "Representative of 51 uncoded SWIs in the WMS SOP customer-service cluster"}]},"sales": {"id": "sales","name": "Sales","counts": {"WMS_SOP_total": 69,"WMS_SOP_note": "Shared bucket with Customer Service — 69 docs spanning both sales and CS functions","WMS_SOP_SWI": 51,"WMS_SOP_Procedure": 15,"WMS_SOP_StandardWork": 2,"QA_SOP_VE_total": 10,"QA_SOP_VE_groups": 5,"QA_SOP_VE_active": 0,"QA_SOP_VE_note": "All 5 VE procedure groups are BAJA; no active QA SOP for Sales","ODG_LSW_Archive_roles": ["Supervisor - Sales","Coordinator - Sales","Inside Sales Rep (completed LSW)"],"embedded_BWIs": 0},"drives": ["WMS_SOP","ODG_LSW_Archive"],"documents": [{"title": "LSW — Inside Sales Rep","docType": "LSW","area": "Role Standard Work","product": null,"owner": "ODG","drive": "ODG_LSW_Archive","href": null,"lang": "EN","representative": false,"note": "Completed LSW for the Inside Sales Rep role — hour-by-hour Mon–Fri schedule covering prospecting, calls, huddle, follow-up, order entry, CRM admin."},{"title": "1 on 1 Review Process","docType": "Procedure","area": "Performance Management","product": null,"owner": "Sales Team Lead","drive": "WMS_SOP","href": null,"lang": "EN","representative": false,"note": "Linked form: '1 on 1 Service Team Format for Team Leads_Jan 2026.docx'. Covers CRM audit, Power BI Revenue Tracker, Lead Manager, Calendar review, and Standard Work adherence check."},{"title": "Sample Approval Process — Galls Physical Sample Workflow","docType": "Procedure","area": "Sample Management","product": "Galls","owner": "Sales / Customer Service","drive": "WMS_SOP","href": null,"lang": "EN","representative": false},{"title": "World Emblem New Customer Account Setup","docType": "Form","area": "Customer Onboarding","product": null,"owner": "Sales / Finance AR","drive": "WMS_SOP","href": null,"lang": "EN","representative": false},{"title": "Revenue Tracker Review","docType": "Procedure","area": "Forecasting / Reporting","product": null,"owner": null,"drive": "WMS_SOP","href": null,"lang": "EN","representative": false},{"title": "Account Report CRM","docType": "SWI","area": "CRM Management","product": null,"owner": null,"drive": "WMS_SOP","href": null,"lang": "EN","representative": false},{"title": "Representative SWI — Sales outbound process","docType": "SWI","area": "Outbound Sales","product": null,"owner": null,"drive": "WMS_SOP","href": null,"lang": "EN","representative": true,"note": "Representative of ~51 uncoded SWIs in the WMS SOP Sales/CS cluster"}]},"operations": {"id": "operations","name": "Operations / Production","counts": {"WMS_SOP_total": 74,"WMS_SOP_SWI": 69,"WMS_SOP_Procedure": 4,"WMS_SOP_note": "Plus ~497 general/uncategorized SWIs (many in Spanish for production sub-processes — Acomodo de órdenes, Afilado navajas automerrow, etc.)","QA_SOP_PO_total": 292,"QA_SOP_PO_groups": 65,"QA_SOP_PO_docTypes": ["Procedure (PR)","Form (FR)","Work Instruction (IN)"],"QA_SOP_PO_note": "65 procedure groups for Mexico production (Bordado Multihead, Merrow, Chopping, Shipping, Auto-merrow, Flexstyle, NBI, Leather, PV+, CNC). Plus separate Production USA folder: 25 files, Level III SWIs for Houston/Norcross.","ODG_LSW_Archive_roles": ["Manager - Manufacturing","Supervisor - Embroidery","Supervisor - Perfect Print","Supervisor - New Products CNC","Supervisor - New Products PV+","Team Leader - Perfect Print","Team Leader - Single Head","Team Leader - Flexstyle","Team Leader - Leather","Team Leader - NBI","Team Leader - Direct Embroidery","Team Leader - Water Spider"],"embedded_BWIs": 1},"drives": ["WMS_SOP","QA_SOP","ODG_LSW_Archive"],"documents": [{"title": "Short-Code Order Entry — Standard Work for Remake Jobs (Galls Color & Similar Programs)","docType": "BWI","area": "Order Entry / Production Routing","product": "Galls Color / Remake Jobs","owner": "Operations / Jim Kozel","drive": "WMS_SOP","href": null,"lang": "EN","embeddedInApp": true,"sopDataPath": "data/sops/operations-shortcode.json"},{"title": "Standard Work Instruction — Operator Level (bilingual EN/ES template)","docType": "Template","area": "Production / Manufacturing","product": null,"owner": "ODG","drive": "WMS_SOP","href": null,"lang": "bilingual","representative": false,"note": "Two-sheet xlsx: Work Chart (time-motion, Seq No/Work Steps/Element Time/SWIP/Quality/Safety) and Work Instruction (Main Step/Critical Point SQDC/Reason/Visual Aids). Also contains completed example: Ticket Intake & Validation (DESK365)."},{"title": "Abastecimiento de hilo","docType": "SWI","area": "Production — Thread Supply","product": null,"owner": null,"drive": "WMS_SOP","href": null,"lang": "ES","representative": false},{"title": "Bobbin Tension","docType": "SWI","area": "Production — Embroidery Setup","product": null,"owner": null,"drive": "WMS_SOP","href": null,"lang": "EN","representative": false},{"title": "Automerrow","docType": "SWI","area": "Production — Automerrow Operations","product": null,"owner": null,"drive": "WMS_SOP","href": null,"lang": "EN","representative": false},{"title": "Arte Flexbroidery","docType": "SWI","area": "Production — Flexbroidery","product": "Flexbroidery","owner": null,"drive": "WMS_SOP","href": null,"lang": "EN","representative": false},{"title": "Ajuste Plan Producción","docType": "Procedure","area": "Production Planning","product": null,"owner": null,"drive": "WMS_SOP","href": null,"lang": "ES","representative": false},{"title": "QA SOP — Bordado Multihead (PO-PR, 65 production procedure groups)","docType": "Procedure","area": "Production — Embroidery","product": "Multihead Embroidery","owner": null,"drive": "QA_SOP","href": null,"lang": "ES","representative": true,"note": "Representative of 65 QA SOP procedure groups under PO (Production Mexico): Bordado Multihead, Merrow, Chopping, Shipping, Auto-merrow, Flexstyle, NBI, Leather, PV+, CNC. 292 files total, each group has current procedure + revisions + forms."},{"title": "Production USA — Level III SWIs (Houston / Norcross)","docType": "Work-Instruction","area": "Production — USA Plants","product": null,"owner": null,"drive": "QA_SOP","href": null,"lang": "EN","representative": true,"note": "Separate Production USA top-level folder: 25 files, Document Control, Types and Hierarchy Standard, Level III SWIs for Houston and Norcross operations."}]},"marketing": {"id": "marketing","name": "Marketing","counts": {"WMS_SOP_total": 0,"QA_SOP_MK_total": 2,"QA_SOP_MK_groups": 2,"QA_SOP_MK_note": "Formato detonación, NDA — minimal formal QA SOP coverage","ODG_LSW_Archive_roles": ["Manager - Marketing (Mexico)","Coordinator - Marketing (Mexico)"],"ODG_LSW_live": 0,"ODG_LSW_note": "Marketing folder in the live ODG LSW drive is empty; LSW only in Archive. Randy Carr (Executive) has an LSW in the Executive archive.","embedded_BWIs": 0},"drives": ["QA_SOP","ODG_LSW_Archive"],"documents": [{"title": "MK — Formato detonación","docType": "Form","area": "Marketing Operations","product": null,"owner": null,"drive": "QA_SOP","href": null,"lang": "ES","representative": false},{"title": "MK — NDA (Non-Disclosure Agreement procedure)","docType": "Procedure","area": "Contracts / Legal","product": null,"owner": null,"drive": "QA_SOP","href": null,"lang": "ES","representative": false},{"title": "LSW — Manager Marketing (Mexico, Archive)","docType": "LSW","area": "Role Standard Work","product": null,"owner": "ODG","drive": "ODG_LSW_Archive","href": null,"lang": "ES","representative": true,"note": "LSW for Marketing Manager (Mexico) from ODG LSW Archive. Live ODG LSW drive Marketing folder is currently empty — rollout in progress."},{"title": "LSW — Coordinator Marketing (Mexico, Archive)","docType": "LSW","area": "Role Standard Work","product": null,"owner": "ODG","drive": "ODG_LSW_Archive","href": null,"lang": "ES","representative": true,"note": "LSW for Marketing Coordinator (Mexico) from ODG LSW Archive."}]},"hr": {"id": "hr","name": "Human Resources","counts": {"WMS_SOP_total": 10,"WMS_SOP_SWI": 7,"WMS_SOP_BWI": 1,"WMS_SOP_note": "ADP Canada Time-Off, Approving Time-Off ADP, Annual Performance Salary — bilingual docs","QA_SOP_RH_total": 647,"QA_SOP_RH_groups": 44,"QA_SOP_RH_docTypes": ["Policy (DA)","Procedure (PR)","Form (FR)"],"QA_SOP_RH_note": "Largest QA SOP department by file count (647). Covers: Alta/Baja trabajador, Nómina, Reclutamiento, Seguridad e Higiene, Vacaciones, Evaluación desempeño.","ODG_LSW_Archive_roles": ["Manager - HR","Coordinator - HR"],"ODG_LSW_live": 0,"ODG_LSW_note": "HR folder in live ODG LSW drive is empty; LSW only in Archive","embedded_BWIs": 0},"drives": ["WMS_SOP","QA_SOP","ODG_LSW_Archive"],"documents": [{"title": "ADP Canada Time-Off","docType": "SWI","area": "Payroll / Time Management","product": "ADP Canada","owner": null,"drive": "WMS_SOP","href": null,"lang": "EN","representative": false},{"title": "Approving Time-Off ADP","docType": "SWI","area": "Time Management","product": "ADP","owner": null,"drive": "WMS_SOP","href": null,"lang": "EN","representative": false},{"title": "Annual Performance Salary","docType": "SWI","area": "Performance Management / Compensation","product": null,"owner": null,"drive": "WMS_SOP","href": null,"lang": "EN","representative": false},{"title": "BWI — HR process (WMS SOP, 1 BWI)","docType": "BWI","area": "HR Operations","product": null,"owner": null,"drive": "WMS_SOP","href": null,"lang": "EN","representative": true,"note": "One BWI present in the WMS SOP HR cluster — title not enumerated in the discovery; representative entry."},{"title": "RH — Alta/Baja trabajador (QA SOP RH group)","docType": "Procedure","area": "Employee Onboarding / Offboarding","product": null,"owner": null,"drive": "QA_SOP","href": null,"lang": "ES","representative": false},{"title": "RH — Reclutamiento (QA SOP RH group)","docType": "Procedure","area": "Recruitment","product": null,"owner": null,"drive": "QA_SOP","href": null,"lang": "ES","representative": false},{"title": "RH — Nómina (QA SOP RH group)","docType": "Procedure","area": "Payroll","product": null,"owner": null,"drive": "QA_SOP","href": null,"lang": "ES","representative": false},{"title": "RH — Seguridad e Higiene (QA SOP RH group)","docType": "Policy","area": "Safety / Compliance","product": null,"owner": null,"drive": "QA_SOP","href": null,"lang": "ES","representative": false},{"title": "RH — Evaluación desempeño (QA SOP RH group)","docType": "Procedure","area": "Performance Management","product": null,"owner": null,"drive": "QA_SOP","href": null,"lang": "ES","representative": false},{"title": "RH — 44 QA SOP procedure groups (representative)","docType": "Procedure","area": "HR Operations (Mexico)","product": null,"owner": null,"drive": "QA_SOP","href": null,"lang": "ES","representative": true,"note": "Representative of 44 QA SOP procedure groups (647 files) for HR. Named entries above are a sample of the full set."},{"title": "LSW — Manager HR (Archive)","docType": "LSW","area": "Role Standard Work","product": null,"owner": "ODG","drive": "ODG_LSW_Archive","href": null,"lang": "EN","representative": true,"note": "From ODG LSW Archive. Live ODG LSW drive HR folder is empty."}]},"odg": {"id": "odg","name": "ODG (Organizational Development Group)","counts": {"WMS_SOP_total": 0,"WMS_SOP_note": "No dedicated WMS SOP cluster for ODG; ODG owns the SW library governance (STW/PM/BWI Checks)","QA_SOP_total": 0,"ODG_LSW_live_files": 9,"ODG_LSW_live_note": "9 files in the live ODG LSW drive — all IT folder (Executive + Managers). ODG's own LSW is managed here.","ODG_LSW_Archive_total": 98,"ODG_LSW_Archive_roles": ["VP of ODG","ODG Manager","ODG Specialist","Executive (CEO, COO, Randy Carr, Nick, Tony)","Director - Art & Digitizing (G. Ramírez)"],"FMDS_new_templates": ["Standard Work Instruction.xlsx (operator SWI)","Role Standard Work.xlsx (AC-FR-087, LSW template, all-dept)"],"embedded_BWIs": 0,"embedded_LSW": 1},"drives": ["ODG_LSW","ODG_LSW_Archive"],"documents": [{"title": "Role Standard Work Template (AC-FR-087)","docType": "Template","area": "Standard Work Governance","product": null,"owner": "ODG","drive": "ODG_LSW","href": null,"lang": "bilingual","representative": false,"note": "Bilingual (EN/ES) Role Standard Work template. Sheets: Expectativas de... / ...Expectations. Fields: Role Title, Leader Name, Area, Purpose (IDMP framing), Date; then itemized table: Element #, What?, When?, What to do?, Tool; organized by time period: Before Work, During Work, After Operation, Training, Team Member Care, Problem. This is the template backing the LSW program."},{"title": "Standard Work Instruction Template (operator level)","docType": "Template","area": "Operations / Production Standard Work","product": null,"owner": "ODG","drive": "ODG_LSW","href": null,"lang": "bilingual","representative": false,"note": "Two-sheet xlsx: Work Chart (time-motion sequence) + Work Instruction (Main Step/Critical Point SQDC/Reason/Visual). Completed example included: Ticket Intake & Validation (DESK365) — shows template works for office processes, not just floor ops."},{"title": "LSW — VP of ODG (cadence: daily FMDS check, weekly board pulse, monthly BWI audit)","docType": "LSW","area": "Role Standard Work","product": null,"owner": "ODG","drive": "ODG_LSW_Archive","href": null,"lang": "EN","embeddedInApp": true,"sopDataPath": "data/sops/_lsw.json","representative": false},{"title": "LSW — ODG Manager","docType": "LSW","area": "Role Standard Work","product": null,"owner": "ODG","drive": "ODG_LSW_Archive","href": null,"lang": "EN","representative": false},{"title": "LSW — ODG Specialist","docType": "LSW","area": "Role Standard Work","product": null,"owner": "ODG","drive": "ODG_LSW_Archive","href": null,"lang": "EN","representative": false},{"title": "LSW — Executive (CEO, COO, Randy Carr, Nick, Tony)","docType": "LSW","area": "Executive Standard Work","product": null,"owner": "ODG","drive": "ODG_LSW_Archive","href": null,"lang": "EN","representative": true,"note": "Executive-level LSWs from the Archive. Format: Formato LSW-Exec-Dir-Mgr. Rev'01.xlsx — two stacked tables: recurring LSW (Meeting/Audit/Admin/Standard Work) + Hoshin/Strategic Deliverables. President example (Andrew K.): 70hr/wk, structured work ~82%, problem-solving/coaching ~18%."}]},"logistics": {"id": "logistics","name": "Supply Chain / Logistics","counts": {"WMS_SOP_total": 64,"WMS_SOP_BWI": 27,"WMS_SOP_SWI": 31,"WMS_SOP_note": "BWI-dominant department — 27 of 64 docs are formal BWIs (highest BWI count of any dept in WMS SOP). Representative BWIs: BWI - Envios Globales, BWI - Importaciones, BWI - Recolecciones FedEx, Approval Request Freight.","QA_SOP_LG_total": 20,"QA_SOP_LG_groups": 2,"QA_SOP_LG_note": "Exportaciones/Importaciones, Control de sellos","ODG_LSW_Archive_roles": ["Manager - Supply Chain","Supervisor - Supply Chain","Coordinator - Supply Chain","Coordinator - Logística (Mexico)","Team Leader - Supply Chain"],"embedded_BWIs": 0},"drives": ["WMS_SOP","QA_SOP","ODG_LSW_Archive"],"documents": [{"title": "BWI — Envios Globales","docType": "BWI","area": "Shipping / Global Freight","product": null,"owner": null,"drive": "WMS_SOP","href": null,"lang": "ES","representative": false},{"title": "BWI — Importaciones","docType": "BWI","area": "Import Operations","product": null,"owner": null,"drive": "WMS_SOP","href": null,"lang": "ES","representative": false},{"title": "BWI — Recolecciones FedEx","docType": "BWI","area": "FedEx Pickup / Shipping","product": "FedEx","owner": null,"drive": "WMS_SOP","href": null,"lang": "ES","representative": false},{"title": "Approval Request Freight","docType": "Procedure","area": "Freight Approval","product": null,"owner": null,"drive": "WMS_SOP","href": null,"lang": "EN","representative": false},{"title": "BWI — Logistics (27 BWIs in WMS SOP — representative)","docType": "BWI","area": "Logistics Operations","product": null,"owner": null,"drive": "WMS_SOP","href": null,"lang": "bilingual","representative": true,"note": "Representative of 27 BWIs in the WMS SOP Logistics cluster. Named entries above are confirmed individual titles from the discovery."},{"title": "LG — Exportaciones / Importaciones (QA SOP group)","docType": "Procedure","area": "Export / Import Operations","product": null,"owner": null,"drive": "QA_SOP","href": null,"lang": "ES","representative": false},{"title": "LG — Control de sellos (QA SOP group)","docType": "Procedure","area": "Seal Control / Customs Compliance","product": null,"owner": null,"drive": "QA_SOP","href": null,"lang": "ES","representative": false},{"title": "LSW — Manager Supply Chain (Archive)","docType": "LSW","area": "Role Standard Work","product": null,"owner": "ODG","drive": "ODG_LSW_Archive","href": null,"lang": "EN","representative": true}]},"it": {"id": "it","name": "IT / Systems","counts": {"WMS_SOP_total": 15,"WMS_SOP_SWI": 14,"WMS_SOP_note": "Add new fabric Episerver, Microsoft Teams Approvals, NetSuite CRM, Business Central","QA_SOP_SI_total": 102,"QA_SOP_SI_groups": 11,"QA_SOP_SI_note": "Equipo cómputo, Soporte técnico, New hire setup, User termination, Zendesk tickets","ODG_LSW_live_files": 9,"ODG_LSW_live_note": "IT folder is the ONLY populated folder in the live ODG LSW drive — 9 files: Executive + IT Managers. Most complete LSW coverage of any department.","ODG_LSW_Archive_roles": ["Manager - IT (Norcross)","Coordinator - IT"],"embedded_BWIs": 0},"drives": ["WMS_SOP","QA_SOP","ODG_LSW"],"documents": [{"title": "Add New Fabric Episerver","docType": "SWI","area": "Content Management / eCommerce","product": "Episerver","owner": null,"drive": "WMS_SOP","href": null,"lang": "EN","representative": false},{"title": "Microsoft Teams Approvals","docType": "SWI","area": "Workflow / Collaboration","product": "Microsoft Teams","owner": null,"drive": "WMS_SOP","href": null,"lang": "EN","representative": false},{"title": "NetSuite CRM","docType": "SWI","area": "CRM / ERP","product": "NetSuite","owner": null,"drive": "WMS_SOP","href": null,"lang": "EN","representative": false},{"title": "Business Central","docType": "SWI","area": "ERP / Finance Systems","product": "Microsoft Business Central","owner": null,"drive": "WMS_SOP","href": null,"lang": "EN","representative": false},{"title": "SI — Equipo cómputo (QA SOP group)","docType": "Procedure","area": "Hardware / Equipment","product": null,"owner": null,"drive": "QA_SOP","href": null,"lang": "ES","representative": false},{"title": "SI — Soporte técnico (QA SOP group)","docType": "Procedure","area": "Technical Support","product": "Zendesk","owner": null,"drive": "QA_SOP","href": null,"lang": "ES","representative": false},{"title": "SI — New Hire Setup (QA SOP group)","docType": "Procedure","area": "IT Onboarding","product": null,"owner": null,"drive": "QA_SOP","href": null,"lang": "ES","representative": false},{"title": "SI — User Termination (QA SOP group)","docType": "Procedure","area": "IT Offboarding","product": null,"owner": null,"drive": "QA_SOP","href": null,"lang": "ES","representative": false},{"title": "SI — Zendesk Tickets (QA SOP group)","docType": "Procedure","area": "IT Support / Ticketing","product": "Zendesk","owner": null,"drive": "QA_SOP","href": null,"lang": "ES","representative": false},{"title": "LSW — IT Executive / Manager (live ODG drive, 9 files)","docType": "LSW","area": "Role Standard Work — IT","product": null,"owner": "ODG","drive": "ODG_LSW","href": null,"lang": "EN","representative": true,"note": "IT is the only department with a populated live ODG LSW drive (9 files: Executive + Managers). Most complete LSW coverage. Form code AC-FR-7.5-050."}]},"finance": {"id": "finance","name": "Finance / Accounting","counts": {"WMS_SOP_total": 62,"WMS_SOP_SWI": 50,"WMS_SOP_Procedure": 11,"WMS_SOP_note": "Primary source for Finance — Accounts Payable Process, ACH and EFT Payment, AR Deposits, Bank Transfer. QA SOP coverage is minimal.","QA_SOP_FI_total": 1,"QA_SOP_FI_groups": 1,"QA_SOP_FI_note": "Only 1 QA SOP procedure: R&D Tax Credit Qualifying Activities","ODG_LSW_Archive_roles": ["Manager - Accounting","Manager - AR","Coordinator - AR (Mexico)","Coordinator - AR (Norcross)","Coordinator - AR (Houston)"],"ODG_LSW_live": 0,"ODG_LSW_note": "Finance folder in live ODG LSW drive is empty; LSW only in Archive","embedded_BWIs": 0},"drives": ["WMS_SOP","QA_SOP","ODG_LSW_Archive"],"documents": [{"title": "Accounts Payable Process","docType": "Procedure","area": "Accounts Payable","product": null,"owner": null,"drive": "WMS_SOP","href": null,"lang": "EN","representative": false},{"title": "ACH and EFT Payment","docType": "SWI","area": "Payments / Banking","product": null,"owner": null,"drive": "WMS_SOP","href": null,"lang": "EN","representative": false},{"title": "AR Deposits","docType": "SWI","area": "Accounts Receivable","product": null,"owner": null,"drive": "WMS_SOP","href": null,"lang": "EN","representative": false},{"title": "Bank Transfer","docType": "SWI","area": "Treasury / Banking","product": null,"owner": null,"drive": "WMS_SOP","href": null,"lang": "EN","representative": false},{"title": "Finance SWIs (50 WMS SOP — representative)","docType": "SWI","area": "Finance Operations","product": null,"owner": null,"drive": "WMS_SOP","href": null,"lang": "EN","representative": true,"note": "Representative of 50 SWIs in the WMS SOP Finance/Accounting cluster. Named entries above are confirmed individual titles."},{"title": "FI — R&D Tax Credit Qualifying Activities","docType": "Procedure","area": "Tax / Compliance","product": null,"owner": null,"drive": "QA_SOP","href": null,"lang": "EN","representative": false,"note": "The only QA SOP procedure for Finance (FI code). All other Finance standard work is in WMS SOP."},{"title": "LSW — Manager Accounting (Archive)","docType": "LSW","area": "Role Standard Work","product": null,"owner": "ODG","drive": "ODG_LSW_Archive","href": null,"lang": "EN","representative": true},{"title": "LSW — Manager AR (Archive)","docType": "LSW","area": "Role Standard Work","product": null,"owner": "ODG","drive": "ODG_LSW_Archive","href": null,"lang": "EN","representative": true}]}}},"data/sops/_lsw.json": {"id": "_lsw","title": "Leader Standard Work (LSW) — ODG Role Cadence","source": "ODG LSW - 10-2025.xlsx (role-based checklist) + Formato LSW-Exec-Dir-Mgr. Rev'01.xlsx (exec planner)","note": "Cadence rows extracted from the ODG LSW sheet. Three roles present: VP of ODG, ODG Manager, ODG Specialist. ~36 recurring activities per role. Format: Activity | Daily | Weekly | Bi-Weekly | Monthly | Quarterly | Hours | Description. The exec planner adds Strategic/Tactical classification, Work Type, Focus, % Time allocation, and Hoshin linkage.","roles": ["VP of ODG","ODG Manager","ODG Specialist"],"frequencyEnum": ["Daily","4x/Wk","2x/Wk","Weekly","Bi-Weekly","3x/Mo","Monthly","Bi-Monthly","Quarterly","Semi-Annual","Annual","Every-Other-Year"],"workTypeEnum": ["Meeting","Audit","Administrative","Environmental Scan","Standard Work","Email","Video","Recognition","Community"],"cadenceRows": [{"activity": "Check ODG FMDS Data","frequency": "Daily","workType": "Administrative","stratTactical": "Tactical","focus": "FMDS","description": "Review ODG board KPIs (Training Plan vs Actual, SRR). Confirm data is current and accurate before the daily start-up.","boardLink": "odg"},{"activity": "ODG Start-up Meeting","frequency": "Daily","workType": "Meeting","stratTactical": "Tactical","focus": "FMDS","description": "Daily start-up / FMDS board review / activities. Attendees: ODG team. Brief standup — what's red, who owns it, what's the plan.","boardLink": "odg"},{"activity": "Check SW Library Audits","frequency": "Daily","workType": "Audit","stratTactical": "Tactical","focus": "Standard Work","description": "Ensures the most current version of each BWI/SWI is available in the SharePoint SW library. Flag any out-of-revision documents for update via WMS SW Update Requests.","boardLink": null},{"activity": "FMDS Pulse Checks — All Boards","frequency": "Weekly","workType": "Audit","stratTactical": "Tactical","focus": "FMDS","description": "Weekly review of all department FMDS boards (Operations, Sales, Service, Marketing, HR, IT). Confirm actuals are entered and RAG is current. Flag any board with missing data.","boardLink": null},{"activity": "Check Executive FMDS Board (Randy's Board)","frequency": "Weekly","workType": "Administrative","stratTactical": "Strategic","focus": "FMDS","description": "Roll-up of data for the CEO board. Tuesdays. Ensure the Leadership OS inputs are accurate before Randy's review.","boardLink": null,"specificDay": "Tuesday"},{"activity": "8-Step Problem-Solving Coaching","frequency": "Weekly","workType": "Standard Work","stratTactical": "Tactical","focus": "Problem Solving","description": "Coach department leaders and ODG Specialists on active 8-step KZ records. Review step progress in the tracker. Priority: Operations (~30 records) then Finance/Sales.","boardLink": "odg","kzTrackerLink": true},{"activity": "SRR Audits","frequency": "Weekly","workType": "Audit","stratTactical": "Tactical","focus": "SRR","description": "Confirm Strategic Review Rhythm adherence by department. Only Operations is currently running at ~50%; all other depts at 0. Score and update SRR board (ODG FMDS.xlsx cols EM–FA).","boardLink": "odg"},{"activity": "Quality Review Meeting","frequency": "Monthly","workType": "Meeting","stratTactical": "Strategic","focus": "Quality","description": "Standing monthly meeting — last Wednesday. Cross-functional quality review covering OTP, CSAT, Back Credits & Remakes, SRR adherence.","specificDay": "Last Wednesday of month"},{"activity": "Quality Pre-Review Meeting","frequency": "Monthly","workType": "Meeting","stratTactical": "Tactical","focus": "Quality","description": "Two days prior to the Quality Review Meeting. Prepare data and flag open KZ items that need resolution before the review.","specificDay": "2 days before last Wednesday"},{"activity": "STW / PM / BWI Checks","frequency": "Monthly","workType": "Audit","stratTactical": "Tactical","focus": "Standard Work","description": "Leaders ensure Standard Work is followed, updated, and taught. Audit a sample of BWIs per department against current practice. Flag gaps for WMS SW Update Request tickets.","boardLink": null},{"activity": "Development Plan Checks","frequency": "Quarterly","workType": "Administrative","stratTactical": "Strategic","focus": "People","description": "Review individual development plans for ODG team members and cross-department leaders enrolled in ODG training programs."},{"activity": "Train-the-Trainer Certification","frequency": "Quarterly","workType": "Standard Work","stratTactical": "Strategic","focus": "Training","description": "Eric signs off on trainers who are certified to deliver ODG programs (FMDS, 8-Step, BWI, JIT). Certification is the quality gate before a trainer delivers independently."},{"activity": "L1-L2 COO Hoshin & KPI Review","frequency": "Weekly","workType": "Meeting","stratTactical": "Strategic","focus": "Hoshin / KPI","description": "Layer 1–2 Hoshin and KPI review. Attendees: COO + L2 Operations lead. Links the FMDS board actuals to Hoshin strategic deliverables. Drives accountability for red KPIs (e.g. Mexico OTP).","boardLink": "operations"},{"activity": "Layer 1-1 Hoshin/KPI/Tactical Weekly Meeting with CEO","frequency": "Weekly","workType": "Meeting","stratTactical": "Strategic","focus": "Hoshin / KPI","description": "Executive-level roll-up. CEO + direct reports. The KPI cascade from department FMDS boards feeds this meeting. This is where the ▲ 'rolls up to Leadership OS' pointer points.","boardLink": null}],"timeAllocationModel": {"note": "From Formato LSW-Exec-Dir-Mgr. Rev'01.xlsx — President example (Andrew K., 70-hr week): structured work ~82% / problem-solving & coaching ~18% / Hoshin/strategic deliverables tracked separately. The time budget is the explicit, auditable allocation that ensures coaching time is protected.","buckets": [{"label": "Structured Work","pct": 0.82,"illustrative": true},{"label": "Problem-Solving & Coaching","pct": 0.18,"illustrative": true}]}},"data/sops/operations-shortcode.json": {"id": "operations-shortcode","title": "Short-Code Order Entry — Standard Work for Remake Jobs (Galls Color & Similar Programs)","deptId": "operations","docType": "BWI","purpose": "To define the correct short-code selection and order-entry process for remake jobs (including high-volume programs such as Galls color), preventing the standard-work breakage that produces preventable credits and inflates OTP denominators.","scope": "All Operations order-entry staff and plant leads (Mexico, Norcross, Houston, Canada) processing remake orders under short-code routing. Applies whenever a job is designated a remake and must be re-entered under a distinct order type.","linkedForms": ["WMS SW Update Requests (SharePoint)","OTP Tracker (COO Board)","KZ tracker — Pricing Credit Memos (KZ-346)"],"note": "This SOP represents the standard-work gap identified in the T3 OTP story (Jun 24 review): a $40K breakage event where the wrong short-code was applied to a Galls color remake run, causing preventable credits and inflating the OTP denominator. Jim Kozel's question: 'I want to see what part of the standard work broke.' This BWI documents the corrected process. Values are real (OTP target 0.985; Mexico Mar 0.750; Galls color backlog 1,917 samples).","steps": [{"n": 1,"mainStep": "Identify the job type before entering the order","keyPoints": "Check whether the job is a first-run or a remake. For remake jobs, the short-code is different from the standard production code. Do not assume — verify against the original order number.","reason": "Applying the wrong short-code routes the job incorrectly in WPS, assigns incorrect material costs, and causes a credit memo when the billing hits NetSuite. Each credit is tracked on the OTP board (Materials $/Revenue and Back Credits KPIs). The Feb–Mar 2026 Galls color spike generated ~$40K in preventable credits from this error."},{"n": 2,"mainStep": "Look up the correct short-code for the program in the WMS code table","keyPoints": "Open WMS → Order Entry → Short-Code Reference Table. Match the program name (e.g. 'Galls Color', 'Embroidery Remake') to its designated remake code. The remake code is never the same as the first-run code for the same program.","reason": "The Short-Code Reference Table is the single source of truth for routing. Using a memorized or guessed code is the key point that 'makes or breaks' this step — it is the root cause in KZ-346 (Pricing Credit Memos Feb '26)."},{"n": 3,"mainStep": "Enter the order using the verified remake short-code","keyPoints": "Confirm: short-code field matches the reference table entry; original order number is linked in the 'Source Order' field; job is flagged as REMAKE in the work-order header. Do not proceed if any of these three are missing.","reason": "The 'REMAKE' flag triggers the correct floor routing so the plant team knows this is a rework job — prevents double-counting in the OTP denominator (a remake that is then tracked as a new job inflates the denominator, worsening the OTP percentage even if the plant delivers on time)."},{"n": 4,"mainStep": "Verify the order before releasing to the floor","keyPoints": "Two-person check: the entering clerk and the plant supervisor both confirm the short-code and REMAKE flag before releasing. For high-volume programs (>500 units), the lead must also approve.","reason": "The Galls color backlog reached 1,917 samples in part because a batch of incorrectly coded orders was released and only caught at billing. A pre-release two-person check for high-volume programs stops the error before it compounds. Quality check at the point of occurrence."},{"n": 5,"mainStep": "Log the remake in the OTP tracker at the start of the week","keyPoints": "Add the remake job count to the weekly OTP tracker (COO Board denominator column) immediately when the order is released. Do not wait until week-end.","reason": "Mexico OTP ran 0.39–0.55 weekly (weeks 15–23) in part because the denominator was inflated by unreported sample-surge volumes. Timely logging gives Jim and the plant lead visibility to the true denominator before the week closes, allowing early escalation."},{"n": 6,"mainStep": "If a credit is required, initiate the KZ process","keyPoints": "Any preventable credit (Standard = $0) triggers an 8-Step Problem Solving entry. Log in the KZ Tracker (Operations tab). Assign an owner and start date. Do not absorb credits silently.","reason": "Preventable credits are a system signal, not a one-off. KZ-346 (Pricing Credit Memos) and KZ-339 (Credit and Rebill) both started with credits that were initially absorbed. The 8-step is how the plant confirms root cause and updates this standard work (Step 8 Yokoten)."}],"revisions": [{"date": "2026-07-01","revision": "01","description": "Original document — drafted from T3 OTP story (Jun 24) and KZ-346 Pricing Credit Memos discovery. Captures the short-code standard-work breakage root cause identified by Jim Kozel.","requester": "Supernal / FMDS OS build"}],"elaborated": "Supernal","revised": null,"approved": null},"data/sops/service-prospecting.json": {"id": "service-prospecting","title": "Service Prospecting — WEI & HP Outbound Call Process","deptId": "service","docType": "BWI","purpose": "To standardize the prospecting and outbound-call workflow for Service reps managing WEI and Hero's Pride accounts, ensuring consistent follow-through from initial outreach to opportunity creation.","scope": "All Service reps on Team JC and Team Noel handling WEI outbound calls, HP New Quotes, and WEI New Opportunity tracking.","linkedForms": ["HubSpot New Opportunity form","HP New Quote submission (NetSuite)","WMS SW Update Requests"],"note": "This SOP is structured from the BWI format discovered in WE standard-work artifacts. The prospecting process and activity targets are drawn from the Service board (weekly targets: # Calls 251/wk, # WEI New Opps 48/wk, # HP New Quotes 10/wk per rep). Time-with-customer is flagged as a fast-follow metric gap — calls and meetings are current proxies.","steps": [{"n": 1,"mainStep": "Prepare your weekly target list","keyPoints": "Pull your assigned accounts from HubSpot; confirm your WEI revenue target (e.g. Diane 26,960/wk, Cullen 20,358/wk, Dylan 25,377/wk, Colten 18,883/wk); note any open opportunities from prior week.","reason": "Ensures every rep starts the week with a clear, prioritized call list aligned to the weekly board targets — reduces wasted outreach and ensures on-target revenue pacing."},{"n": 2,"mainStep": "Log each outbound call in HubSpot immediately after completion","keyPoints": "Record call disposition (reached / voicemail / no answer); note outcome in contact record; if an opportunity surface — open a WEI New Opp immediately.","reason": "# Calls is a board-tracked KPI (target 251/wk all reps). Unlogged calls create a gap between real activity and the FMDS board actuals, making the data unreliable. Immediate logging prevents end-of-week re-keying errors."},{"n": 3,"mainStep": "Create a WEI New Opportunity when a prospect signals intent","keyPoints": "Open the HubSpot Opportunity record on the call (do not wait); set estimated close date and value; link to the account; tag as WEI.","reason": "# WEI New Opps (target 48/wk board-level) is a leading indicator for Incoming Revenue WE. Delayed entry overstates open-quote lag and distorts the pipeline view for the L2 leader."},{"n": 4,"mainStep": "Submit HP New Quotes via NetSuite same day","keyPoints": "HP New Quote target is 10/wk per rep (Diane baseline). Quote must include pricing, artwork spec, and ship-to before submission. Route to HP processing queue.","reason": "HP Quotes are a separate revenue stream (Incoming Rev HPI target 36,755/wk). Late or incomplete quotes create the HP pipeline gap flagged in the KZ-303 (HP Quote-to-Order shortfall $80,859)."},{"n": 5,"mainStep": "Apply the 3-Touch Rule for open WEI Opportunities over 14 days","keyPoints": "Touch 1: email with value summary. Touch 2: follow-up call within 48 hrs. Touch 3: internal escalation to team lead if no response by day 14. Log every touch in HubSpot.","reason": "Countermeasure from KZ-303 (Hero's Pride Quote-to-Order Revenue). No standardized follow-up process was the confirmed root cause of the $80,859 shortfall. This rule closes that gap."},{"n": 6,"mainStep": "Review your board actuals every Monday with your Team Lead (JC or Noel)","keyPoints": "Compare your weekly revenue actual vs target; check # Calls, # WEI New Opps, # HP New Quotes vs targets; flag any gap for the 8-step if you are below target 2 consecutive weeks.","reason": "L2 Leader Standard Work includes a weekly board review. The rep's L1 My Board data feeds the L2 Team Board — accurate weekly data is the input the team lead and the system depend on for RAG status."}],"revisions": [{"date": "2026-07-01","revision": "01","description": "Original document — embedded in FMDS OS prototype from Service board discovery. Based on WE BWI format and Service board KPI targets.","requester": "Supernal / FMDS OS build"}],"elaborated": "Supernal","revised": null,"approved": null}};

/* ==== lib/rag.js ==== */
__M["lib/rag.js"] = (function(){
function ragStatus(actual, target, direction = 'higher_better',
                          bands = { green: 1.0, amber: 0.95 }) {
  if (actual == null || target == null || Number.isNaN(actual) || Number.isNaN(target)) return 'nodata';
  // Special case: target === 0 (e.g. safety metrics TRIR/DART where 0 incidents = perfect)
  if (target === 0) {
    if (direction === 'lower_better') return actual <= 0 ? 'green' : 'red';
    return actual >= 0 ? 'green' : 'red';
  }
  const ratio = direction === 'higher_better' ? actual / target : target / actual;
  if (ratio >= bands.green) return 'green';
  if (ratio >= bands.amber) return 'amber';
  return 'red';
}

;return { ragStatus };
})();

/* ==== lib/explain.js ==== */
__M["lib/explain.js"] = (function(){
/**
 * lib/explain.js — Per-KPI explanation engine
 *
 * Every KPI in the FMDS OS carries a short, grounded explanation surfaced when
 * you click into it. This module computes that explanation as a pure function
 * (no DOM) so both the Operations location board and the other-department KPI
 * Boards can share it, and so it is unit-testable.
 *
 * explainKpi(kpi, dept, opts) → { text, definition, source, why }
 *
 *   definition — "what this measures" (from name + unit + cascade level)
 *   source     — "what feeds it"      (targetSource, falling back to source)
 *   why        — RAG-aware "why it's green/amber/red/no-data right now",
 *                grounded in the KPI's own actual vs target (+ story/flag when present)
 *   text       — the three joined into a 1–2 sentence line
 *
 * Grounding priority for `why`:
 *   1. kpi.story.text        (T3 narrative — richest)
 *   2. kpi.flagDetail        (specific data-quality explanation)
 *   3. templated actual-vs-target sentence tuned to the RAG status + direction
 *
 * opts:
 *   rag           — precomputed RAG status ('green'|'amber'|'red'|'nodata').
 *                   If omitted, computed from actualOverride/kpi.actual vs target.
 *   actualOverride — the actual value to reason about (e.g. a location's sub actual
 *                   when the main is Mechanism-B independent). Defaults to kpi.actual.
 */

const { ragStatus } = __M["lib/rag.js"];

// ─── Value formatting (mirrors the views, kept local so this stays pure) ──────

function fmt(v, unit, targetType) {
  if (v == null) return '—';
  if (typeof v !== 'number') return String(v);
  const u = unit || targetType || '';
  if (typeof u === 'string' && (u.startsWith('$') || u.includes('$'))) {
    if (Math.abs(v) >= 1_000_000) return '$' + (v / 1_000_000).toFixed(2) + 'M';
    if (Math.abs(v) >= 1_000)     return '$' + (v / 1_000).toFixed(0) + 'k';
    return '$' + v.toLocaleString();
  }
  if (u === 'ratio' || u === 'rate' || u === 'percent' || u === '%' || u === 'pct') {
    return (v * 100).toFixed(1) + '%';
  }
  if (u === 'pcs_per_labor_hour') return v.toFixed(3) + ' pcs/hr';
  if (u === 'aggregate_labor_hours') return v.toFixed(1) + ' hrs';
  if (u === 'count') return Math.round(v).toLocaleString();
  if (Math.abs(v) >= 1_000_000) return (v / 1_000_000).toFixed(2) + 'M';
  if (Math.abs(v) >= 1_000)     return (v / 1_000).toFixed(0) + 'k';
  return v.toLocaleString(undefined, { maximumFractionDigits: 3 });
}

function cascadeWord(kpi) {
  const lv = kpi.level;
  if (lv === 1 || lv === 'main' || kpi.isMain) return 'main-level';
  if (lv === 2 || lv === 'contributor') return 'contributor-level';
  if (lv === 3 || lv === 'rep') return 'rep-level';
  return null;
}

function dirPhrase(direction) {
  return (direction === 'lower_better') ? 'lower is better' : 'higher is better';
}

// ─── Definition: "what this measures" ────────────────────────────────────────

function buildDefinition(kpi) {
  const cw = cascadeWord(kpi);
  const catBit = kpi.category ? `${kpi.category} · ` : '';
  const levelBit = cw ? `A ${cw} KPI` : 'A KPI';
  return `${catBit}${levelBit} tracked ${dirPhrase(kpi.direction)}.`;
}

// ─── Source: "what feeds it" ─────────────────────────────────────────────────

function buildSource(kpi) {
  if (kpi.manualOnly === true) {
    return 'Manually entered — no source system (hand-keyed).';
  }
  const ts = kpi.targetSource || kpi.source;
  if (!ts) return 'Sourced from the FMDS board.';
  const wasReKeyed = kpi.source && kpi.source !== ts &&
    ['manual', 'hand-keyed', 'coo board', 'literal', 'bowler']
      .some(tok => String(kpi.source).toLowerCase().includes(tok));
  if (wasReKeyed) {
    return `Target source is ${ts} (today re-keyed from ${kpi.source}).`;
  }
  return `Fed from ${ts}.`;
}

// ─── Why: RAG-aware, grounded ────────────────────────────────────────────────

function templatedWhy(kpi, rag, actual) {
  const target = kpi.target;
  const unit = kpi.unit;
  const tt = kpi.targetType;
  const a = fmt(actual, unit, tt);
  const t = fmt(target, unit, tt);

  if (rag === 'nodata') {
    if (kpi.nodataNote) return kpi.nodataNote;
    return `No actual is posted yet, so status can't be computed (target ${t}).`;
  }
  if (rag === 'green') {
    return `On track — latest actual ${a} meets the ${t} target.`;
  }
  if (rag === 'amber') {
    return `At risk — latest actual ${a} is close to but under the ${t} target.`;
  }
  // red
  return `Off track — latest actual ${a} is below the ${t} target (${dirPhrase(kpi.direction)}).`;
}

function buildWhy(kpi, rag, actual) {
  // Richest first: a narrative story, then a specific data-flag detail.
  if (kpi.story && kpi.story.text) {
    return String(kpi.story.text).replace(/\s+/g, ' ').trim();
  }
  if (kpi.flagDetail) {
    return String(kpi.flagDetail).replace(/\s+/g, ' ').trim();
  }
  return templatedWhy(kpi, rag, actual);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * explainKpi(kpi, dept, opts) → { text, definition, source, why }
 */
function explainKpi(kpi, dept = {}, opts = {}) {
  const actual = opts.actualOverride !== undefined ? opts.actualOverride : kpi.actual;
  const rag = opts.rag || (
    (kpi.nodata || actual == null || kpi.target == null)
      ? 'nodata'
      : ragStatus(actual, kpi.target, kpi.direction || 'higher_better')
  );

  const definition = buildDefinition(kpi);
  const source     = buildSource(kpi);
  const why        = buildWhy(kpi, rag, actual);

  return {
    definition,
    source,
    why,
    text: `${definition} ${source} ${why}`,
  };
}

;return { explainKpi };
})();

/* ==== lib/registry.js ==== */
__M["lib/registry.js"] = (function(){
const byId = (dept, id) => dept.kpis.find(k => k.id === id) || null;
const mains = (dept) => dept.kpis.filter(k => k.isMain);
const contributorsOf = (dept, id) => {
  const k = byId(dept, id); if (!k || !k.contributors) return [];
  return k.contributors.map(cid => byId(dept, cid)).filter(Boolean);
};
const flagged = (dept) => dept.kpis.filter(k => k.flag);

;return { byId, mains, contributorsOf, flagged };
})();

/* ==== lib/eightstep.js ==== */
__M["lib/eightstep.js"] = (function(){
function progress(kz) {
  const steps = kz.steps || {};
  const done = Object.values(steps).filter(Boolean).length;
  return { done, total: 8, pct: Math.round((done / 8) * 100) };
}
const isClosed = (kz) => progress(kz).done === 8;
const byDept = (records, deptId) => records.filter(r => r.deptId === deptId);
// kzNumber is deliberately null (not a fake placeholder string) — a fresh,
// in-memory 8-step draft doesn't have a real sequential number yet, and
// callers (views/problemsolving.js's wizard header,
// views/askmark.js's escalation read-back) must render/word around that
// honestly rather than display a number that was never allocated. `title`
// defaults to the real problem `item` (usually the triggering KPI's own
// name) so the wizard header always has a grounded, non-placeholder title
// even before any step content exists.
function newKZ({ item, title, who, deptId }) {
  return { item, title: title || item || null, who, deptId, kzNumber: null, start: null,
    steps: {1:false,2:false,3:false,4:false,5:false,6:false,7:false,8:false},
    active: true, closed: false };
}

;return { progress, isClosed, byDept, newKZ };
})();

/* ==== lib/context.js ==== */
__M["lib/context.js"] = (function(){
/**
 * lib/context.js — Department context layer for Mark (the AI employee)
 *
 * Assembles a single "what Mark knows about this department" object by
 * composing the existing pure modules (rag, explain, registry, eightstep)
 * with externally-owned reason / comment / KZ (8-step) data passed in via
 * opts. This module is pure and dependency-injectable — no __ls,
 * no fetch — so it stays unit-testable in plain Node and so later
 * consumers (Ask Mark chat, the red-KPI accountability workflow, the
 * interactive 8-step co-pilot) can all build off the same shape.
 *
 * buildDeptContext(dept, opts) → {
 *   deptId, deptName,
 *   kpis: [{ id, name, rag, actual, target, unit, level, isMain, parentId, owner, explanation }],
 *   reds: [kpiId],
 *   reasons, comments, responses,
 *   kzRecords: [{ kzNumber, item, who, linkedKpiId, done, closed }],
 *   ownerOf(kpiId) → string,
 * }
 *
 * opts (all optional, each defaults to []):
 *   reasons    — reason-log entries for this dept (lib/reasons.js shape), passed through untouched.
 *   comments   — comment-thread entries for this dept (lib/comments.js shape), passed through untouched.
 *   kzRecords  — raw 8-step KZ records (any dept); filtered to this dept via byDept and re-shaped.
 *   responses  — accountability response-lifecycle entries for this dept (lib/accountability.js
 *                getResponsesByDept shape), passed through untouched. Backs the backend's
 *                get_response_status tool (server/mark_tools.py).
 */

const { ragStatus } = __M["lib/rag.js"];
const { explainKpi } = __M["lib/explain.js"];
const { byId } = __M["lib/registry.js"];
const { byDept, progress } = __M["lib/eightstep.js"];

// ─── Ownership ────────────────────────────────────────────────────────────────

/**
 * ownerFor(dept, kpi) → string
 *
 * Main/board KPIs (kpi.isMain === true, or kpi.level <= 1) are owned by the
 * department's L2 lead (dept.lead). Sub-KPIs are owned by kpi.who when a rep
 * is assigned; otherwise ownership falls back to the L2 lead. Always returns
 * a non-empty string (falls back to 'Unassigned' if dept.lead is also missing).
 */
function ownerFor(dept = {}, kpi = {}) {
  const lead = dept.lead || 'Unassigned';
  const isBoardKpi = kpi.isMain === true || (typeof kpi.level === 'number' && kpi.level <= 1);
  if (isBoardKpi) return lead;
  if (kpi.who) return kpi.who;
  return lead;
}

// ─── RAG (mirrors explainKpi's own nodata-guard so the two never disagree) ─────

function kpiRag(kpi) {
  if (kpi.nodata || kpi.actual == null || kpi.target == null) return 'nodata';
  return ragStatus(kpi.actual, kpi.target, kpi.direction || 'higher_better');
}

// ─── KZ (8-step) record shaping ─────────────────────────────────────────────
//
// Stored KZ records (data/kz-records.json) use `title` for the human-readable
// item description and a numeric `item` for the row's sequence number, while
// freshly-opened records (lib/eightstep.js newKZ) hold the description in
// `item` directly. We surface the description under the output's `item` key,
// preferring `title` (the descriptive field) when present.

function mapKZ(kz) {
  const item = kz.title != null ? kz.title : (kz.item != null ? kz.item : '');
  const linkedKpiId = kz.linkedKpiId != null ? kz.linkedKpiId
    : (kz._kpiId != null ? kz._kpiId : null);
  return {
    kzNumber: kz.kzNumber,
    item,
    who: kz.who || '',
    linkedKpiId,
    done: progress(kz).done,
    closed: !!kz.closed,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * buildDeptContext(dept, opts = {}) → see module header for full shape.
 * Pure: does not read __ls or fetch JSON. `dept` is a data/<id>.json
 * shaped object ({ id, name, lead, kpis: [...] }); reason/comment/KZ data
 * arrive via opts so this stays testable with no browser globals.
 */
function buildDeptContext(dept, opts = {}) {
  const reasons = opts.reasons || [];
  const comments = opts.comments || [];
  const responses = opts.responses || [];
  const kzInput = opts.kzRecords || [];

  const kpis = (dept.kpis || []).map((kpi) => {
    const rag = kpiRag(kpi);
    const explanation = explainKpi(kpi, dept, { rag });
    return {
      id: kpi.id,
      name: kpi.name,
      rag,
      actual: kpi.actual,
      target: kpi.target,
      unit: kpi.unit,
      level: kpi.level,
      isMain: !!kpi.isMain,
      parentId: kpi.parentId != null ? kpi.parentId : null,
      owner: ownerFor(dept, kpi),
      explanation,
    };
  });

  const reds = kpis.filter((k) => k.rag === 'red').map((k) => k.id);

  const kzRecords = byDept(kzInput, dept.id).map(mapKZ);

  function ownerOf(kpiId) {
    const kpi = byId(dept, kpiId);
    return kpi ? ownerFor(dept, kpi) : (dept.lead || 'Unassigned');
  }

  return {
    deptId: dept.id,
    deptName: dept.name,
    kpis,
    reds,
    reasons,
    comments,
    responses,
    kzRecords,
    ownerOf,
  };
}

;return { ownerFor, buildDeptContext };
})();

/* ==== lib/accountability.js ==== */
__M["lib/accountability.js"] = (function(){
/**
 * lib/accountability.js — red-KPI accountability workflow (store + lifecycle)
 *
 * A red fires a required lightweight response from the KPI's owner (the
 * 4-field response card, spec §5.2); the owner's answer is tracked through a
 * visible response lifecycle (spec §5.3) that is the single roll-up signal
 * Leadership OS reads — "is this red actually being worked?", not just "is it
 * red?". In-memory + __ls-backed, same load/save/uid/seed pattern as
 * lib/reasons.js and lib/comments.js.
 *
 * Detection is deliberately NOT persisted as its own store write: a KPI's
 * red/amber status is always read live off the department data via
 * buildDeptContext() (lib/context.js), so redKpisNeedingResponse() reflects
 * the current board on every call. Only once an owner responds does a
 * tracked entry exist in the store.
 *
 * Entry shape (spec §5.5):
 *   { id, deptId, kpiId, owner, dueDate, answered, onTime,
 *     cause, action, needs8Step, kzNumber,           // the 4 fields
 *     reportBackWhen,
 *     lifecycle: { detected, responded, actionUnderway, eightStepOpened, reported, recovered },
 *       // each stage: { done: boolean, ts: string|null }
 *     ts }
 *
 *   id:             string (crypto.randomUUID or Date.now fallback)
 *   deptId:         string  — e.g. 'operations'
 *   kpiId:          string  — e.g. 'otp'
 *   owner:          string  — who must answer (lib/context.js ownerFor)
 *   dueDate:        ISO 8601 string — response SLA deadline, stamped at creation
 *   answered:       boolean — a response has been submitted
 *   onTime:         boolean — response landed within the SLA window
 *   cause:          string  — field 1, "what's driving the red?"
 *   action:         string  — field 2, "what are you doing about it?"
 *   needs8Step:     boolean — field 3, "does this need an 8-step?"
 *   kzNumber:       string|null — linked KZ (8-step) number when needs8Step
 *   reportBackWhen: string|null — field 4, "when will you report back?"
 *   ts:             ISO 8601 string — when the response was recorded
 */

const { buildDeptContext } = __M["lib/context.js"];

const LS_KEY    = 'fmds_accountability';
const SEED_FLAG = 'fmds_accountability_seeded';

// Phase 1 assumption (not sourced from real data): a red is asked to be
// answered within this many days of being flagged. Purely a UI/queue framing
// device — no invented business figures ride on it.
const RESPONSE_SLA_DAYS = 2;

// Phase 1 assumption: a response is flagged "stalled" once its most recently
// completed lifecycle stage is older than this many days, echoing the
// "stuck at 'action underway' N days" framing in spec §5.3.
const STALL_THRESHOLD_DAYS = 3;

const LIFECYCLE = [
  'detected', 'responded', 'actionUnderway', 'eightStepOpened', 'reported', 'recovered',
];

const STAGE_LABELS = {
  detected:       'Detected',
  responded:      'Responded',
  actionUnderway: 'Action underway',
  eightStepOpened: '8-step opened',
  reported:       'Reported',
  recovered:      'Recovered',
};

// ─── Storage plumbing (mirrors lib/reasons.js) ─────────────────────────────

function load() {
  try {
    return JSON.parse(__ls.getItem(LS_KEY) || '[]');
  } catch { return []; }
}

function save(entries) {
  try { __ls.setItem(LS_KEY, JSON.stringify(entries)); } catch { /* quota */ }
}

function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return String(Date.now()) + '-' + Math.random().toString(36).slice(2, 9);
}

function addDays(iso, days) {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

function makeLifecycle(ts, doneStages = []) {
  const lc = {};
  for (const stage of LIFECYCLE) {
    lc[stage] = doneStages.includes(stage) ? { done: true, ts } : { done: false, ts: null };
  }
  return lc;
}

// ─── Detection ──────────────────────────────────────────────────────────────

/**
 * redKpisNeedingResponse(dept, { includeAmber = false } = {}) →
 *   [{ kpiId, kpi, rag, owner, dueDate }]
 *
 * Red-only by default (spec §10 decision: amber is watch-only, no queue
 * noise). Reads live off buildDeptContext(dept), which already computes
 * per-KPI rag + owner — no separate ragStatus/ownerFor call needed here.
 */
function redKpisNeedingResponse(dept, { includeAmber = false } = {}) {
  const ctx = buildDeptContext(dept);
  const wanted = includeAmber ? ['red', 'amber'] : ['red'];
  const dueDate = addDays(new Date().toISOString(), RESPONSE_SLA_DAYS);
  return ctx.kpis
    .filter((k) => wanted.includes(k.rag))
    .map((k) => ({
      kpiId: k.id,
      kpi: k.name,
      rag: k.rag,
      owner: k.owner,
      dueDate,
    }));
}

// ─── Response store ─────────────────────────────────────────────────────────

/**
 * addResponse({deptId,kpiId,owner,cause,action,needs8Step,kzNumber,reportBackWhen}) → entry
 *
 * Records the owner's 4-field response. Submitting a response is, by
 * definition, the "detected" and "responded" moment for the tracked entry
 * (nothing is persisted before this call — see module header), so both
 * stages are stamped done at the same ts. dueDate/onTime are stamped using
 * the same SLA window redKpisNeedingResponse() frames the queue with.
 */
function addResponse({ deptId, kpiId, owner, cause, action, needs8Step, kzNumber, reportBackWhen }) {
  const now = new Date().toISOString();
  const entry = {
    id: uid(),
    deptId,
    kpiId,
    owner: owner || '',
    dueDate: addDays(now, RESPONSE_SLA_DAYS),
    answered: true,
    onTime: true,
    cause: cause || '',
    action: action || '',
    needs8Step: !!needs8Step,
    kzNumber: kzNumber || null,
    reportBackWhen: reportBackWhen || null,
    lifecycle: makeLifecycle(now, ['detected', 'responded']),
    ts: now,
  };
  const entries = load();
  entries.push(entry);
  save(entries);
  return entry;
}

// Sort newest-first by ts, tie-breaking on original array position (last
// inserted wins) so two entries stamped within the same millisecond still
// resolve deterministically to "most recent" rather than to insertion order.
function newestFirst(entries) {
  return entries
    .map((e, i) => ({ e, i }))
    .sort((a, b) => b.e.ts.localeCompare(a.e.ts) || b.i - a.i)
    .map(({ e }) => e);
}

// Index of the most recent entry matching deptId+kpiId (same "most recent"
// semantics as getResponse/newestFirst above), or -1. A KPI can accumulate
// more than one entry over time (e.g. it recovers, then goes red again) —
// advanceLifecycle must always progress the latest one, not just the first
// match in array order.
function latestIndex(entries, deptId, kpiId) {
  let bestIdx = -1;
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    if (e.deptId !== deptId || e.kpiId !== kpiId) continue;
    if (bestIdx === -1 || e.ts.localeCompare(entries[bestIdx].ts) >= 0) bestIdx = i;
  }
  return bestIdx;
}

/** getResponse({deptId,kpiId}) → entry|null — most recent entry for the KPI, or null. */
function getResponse({ deptId, kpiId }) {
  const matches = load().filter((e) => e.deptId === deptId && e.kpiId === kpiId);
  if (!matches.length) return null;
  return newestFirst(matches)[0];
}

/** getResponsesByDept(deptId) → [entry] — all entries for a dept, newest first. */
function getResponsesByDept(deptId) {
  return newestFirst(load().filter((e) => e.deptId === deptId));
}

// ─── Lifecycle ──────────────────────────────────────────────────────────────

/**
 * advanceLifecycle({deptId,kpiId,stage}) → entry|null
 *
 * Idempotent: advancing an already-done stage is a no-op (ts is not
 * re-stamped). Unknown stage names are ignored (entry returned unchanged).
 * Advancing to 'responded' also flips the top-level `answered` flag, so a
 * bare entry (e.g. one seeded without going through addResponse) reads
 * consistently once it reaches that stage.
 */
function advanceLifecycle({ deptId, kpiId, stage }) {
  const entries = load();
  const idx = latestIndex(entries, deptId, kpiId);
  if (idx === -1) return null;
  const entry = entries[idx];
  if (LIFECYCLE.includes(stage)) {
    const current = entry.lifecycle && entry.lifecycle[stage];
    if (!current || !current.done) {
      const now = new Date().toISOString();
      entry.lifecycle = entry.lifecycle || makeLifecycle(null);
      entry.lifecycle[stage] = { done: true, ts: now };
      if (stage === 'responded') entry.answered = true;
    }
  }
  entries[idx] = entry;
  save(entries);
  return entry;
}

/**
 * linkEightStep({deptId,kpiId,kzNumber}) → entry|null
 *
 * Escalates an EXISTING response entry (one addResponse() has already
 * created) into a linked 8-step: stamps needs8Step true, records kzNumber
 * (overwriting any prior value — callers are expected to have already
 * resolved the correct number, e.g. reusing an existing open KZ already
 * tagged to this KPI via kzRecords' linkedKpiId, before calling this), and
 * advances the lifecycle to 'eightStepOpened' via advanceLifecycle() so the
 * idempotency/ts-stamping rule stays in one place. This is the single path
 * for BOTH escalating at submit time (Field 3 = Yes) and escalating later
 * from an already-answered response that hasn't opened its 8-step yet (e.g.
 * a seeded entry with a kzNumber already attached but eightStepOpened still
 * pending). No-op — returns null — if no response entry exists yet for
 * deptId+kpiId (addResponse() must run first).
 */
function linkEightStep({ deptId, kpiId, kzNumber }) {
  const entries = load();
  const idx = latestIndex(entries, deptId, kpiId);
  if (idx === -1) return null;
  const entry = entries[idx];
  entry.needs8Step = true;
  if (kzNumber) entry.kzNumber = kzNumber;
  entries[idx] = entry;
  save(entries);
  return advanceLifecycle({ deptId, kpiId, stage: 'eightStepOpened' });
}

/**
 * lifecycleView(entry, now = new Date()) → [{stage,label,done,ts,current}]
 *
 * Walks LIFECYCLE in order; the first not-done stage is flagged
 * current:true (the next milestone to complete). If every stage is done,
 * no stage is current. `now` is accepted for interface symmetry with
 * stalledDays() but not otherwise used here — stage display doesn't depend
 * on the clock, only on which stages are done.
 */
function lifecycleView(entry, now = new Date()) {
  const lifecycle = (entry && entry.lifecycle) || {};
  let currentAssigned = false;
  return LIFECYCLE.map((stage) => {
    const st = lifecycle[stage] || { done: false, ts: null };
    const isCurrent = !st.done && !currentAssigned;
    if (isCurrent) currentAssigned = true;
    return { stage, label: STAGE_LABELS[stage], done: !!st.done, ts: st.ts || null, current: isCurrent };
  });
}

/**
 * stalledDays(entry, now = new Date()) → whole number of days since the
 * most recently completed lifecycle stage's ts (0 if nothing has been
 * completed yet, or if the most recent stage just happened).
 */
function stalledDays(entry, now = new Date()) {
  const lifecycle = (entry && entry.lifecycle) || {};
  let lastTs = null;
  for (const stage of LIFECYCLE) {
    const st = lifecycle[stage];
    if (st && st.done && st.ts) lastTs = st.ts;
  }
  if (!lastTs) return 0;
  const nowMs = (now instanceof Date ? now : new Date(now)).getTime();
  const diffMs = nowMs - new Date(lastTs).getTime();
  if (diffMs <= 0) return 0;
  return Math.floor(diffMs / (24 * 60 * 60 * 1000));
}

// ─── Roll-up signal ─────────────────────────────────────────────────────────

/**
 * rollupSignal(deptId) → {redCount, answered, beingActioned, stalled}
 *
 * Summarizes the persisted response entries for a dept — i.e. reds that
 * already have an accountability record, not a live board scan (use
 * redKpisNeedingResponse() for that). beingActioned counts entries at or
 * past 'actionUnderway' that haven't reached 'recovered'; stalled counts
 * those whose progress has gone quiet past STALL_THRESHOLD_DAYS.
 */
function rollupSignal(deptId) {
  const entries = getResponsesByDept(deptId);
  const redCount = entries.length;
  const answered = entries.filter((e) => e.answered).length;
  const beingActioned = entries.filter(
    (e) => e.lifecycle && e.lifecycle.actionUnderway && e.lifecycle.actionUnderway.done
      && !(e.lifecycle.recovered && e.lifecycle.recovered.done)
  ).length;
  const stalled = entries.filter(
    (e) => !(e.lifecycle && e.lifecycle.recovered && e.lifecycle.recovered.done)
      && stalledDays(e) > STALL_THRESHOLD_DAYS
  ).length;
  return { redCount, answered, beingActioned, stalled };
}

// ─── Seed ───────────────────────────────────────────────────────────────────

/**
 * seedDemoAccountability() — the real OTP/Mexico exchange (Jim Kozel, dept
 * lead, Operations). Seeded against the sub-KPI kpiId 'otp_mexico' (not the
 * main 'otp') because that's the KPI KZ-346 is actually linked to
 * (data/kz-records.json's linkedKpiId) — this keeps the Ask Mark queue card,
 * the response, and the escalation's KZ all landing coherently on the same
 * red sub-KPI (Fix 1) rather than the response sitting on the main rollup
 * while the KZ is scoped to the sub. otp_mexico is red (0.75 vs 0.985
 * target) and is the primary drag pulling WE main OTP red too (0.863 vs
 * 0.985), because Mexico ran 0.39–0.55 weekly OTP from ~week 15, denominator
 * inflated by the Galls color sample-volume surge (1,917-sample backlog),
 * plus the $40K short-code standard-work gap tracked as KZ-346 (Pricing
 * Credit Memos). Every figure here is real (data/operations.json,
 * data/sops/operations-shortcode.json) — zero invented numbers.
 * Lifecycle is advanced through 'responded'/'actionUnderway' only —
 * 'eightStepOpened' is deliberately left not-done even though a KZ is
 * already linked, so the demo queue still shows "open the 8-step" as the
 * next step.
 */
function seedDemoAccountability() {
  if (__ls.getItem(SEED_FLAG)) return;
  const entry = addResponse({
    deptId: 'operations',
    kpiId: 'otp_mexico',
    owner: 'Jim Kozel',
    cause: 'OTP — Mexico is red (0.75 vs 0.985 target) and is the primary drag on WE main OTP '
      + '(0.863 vs 0.985) — Mexico ran 0.39–0.55 weekly OTP from ~week 15, and the denominator was '
      + 'inflated by the Galls color sample-volume surge (1,917-sample backlog). The $40K short-code '
      + 'standard-work gap on the Galls color remake (KZ-346, Pricing Credit Memos) is the piece Jim '
      + 'wants root-caused.',
    action: 'Overtime deployed at Mexico to work the backlog; corrected the short-code order-entry '
      + 'standard work (BWI) so remake jobs stop mis-routing into preventable credits.',
    needs8Step: true,
    kzNumber: 'KZ-346',
    reportBackWhen: 'Next T3 review',
  });
  advanceLifecycle({ deptId: entry.deptId, kpiId: entry.kpiId, stage: 'actionUnderway' });
  __ls.setItem(SEED_FLAG, '1');
}

// Auto-seed on first import in the browser, so the accountability queue has
// a populated demo entry even if no view has triggered a response yet.
// Browser-guarded so Node tests (which import this module without a
// __ls global) don't throw.
if (typeof __ls !== 'undefined') {
  try { seedDemoAccountability(); } catch { /* __ls unavailable */ }
}

;return { LIFECYCLE, redKpisNeedingResponse, addResponse, getResponse, getResponsesByDept, advanceLifecycle, linkEightStep, lifecycleView, stalledDays, rollupSignal, seedDemoAccountability };
})();

/* ==== lib/comments.js ==== */
__M["lib/comments.js"] = (function(){
/**
 * lib/comments.js — per-KPI comment thread (interactive: Mark + human)
 *
 * The comment thread is the two-voice conversation that hangs off any KPI:
 *   • Mark (the AI employee) posts "what's driving this" — for a green, what's
 *     going right; for a red/amber, the story + what's wrong. Mark reads the KPI
 *     data AND the meeting record (T2 / T3 / team huddles) to ground it.
 *   • The human (L2 lead / operator) posts tracking notes — "Looking into it,
 *     report back Fri", an action, a status — so the board is a place people
 *     converse and track, not just read.
 *
 * Every rendered thread LEADS with Mark's live read (composeMarkNote), computed
 * from the KPI's current status, so even a green KPI answers "what's driving
 * that green?". Below it sits the stored thread (seeded + posted comments).
 *
 * In-memory + __ls-backed (same pattern as lib/reasons.js). Seeded with
 * a couple of illustrative Mark↔human exchanges on first load.
 *
 * Entry shape:
 *   { id, deptId, kpiId, author, role, kind, text, status, ts }
 *   role:   'ai' (Mark) | 'human'
 *   kind:   'driving' (what's driving the status) | 'action' | 'note'
 *   status: 'red' | 'amber' | 'green' | 'nodata'
 */

const LS_KEY    = 'fmds_comments';
const SEED_FLAG = 'fmds_comments_seeded';

function load() {
  try { return JSON.parse(__ls.getItem(LS_KEY) || '[]'); }
  catch { return []; }
}
function save(entries) {
  try { __ls.setItem(LS_KEY, JSON.stringify(entries)); } catch { /* quota */ }
}
function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return String(Date.now()) + '-' + Math.random().toString(36).slice(2, 9);
}
function esc(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function addComment({ deptId, kpiId, author, role, kind, text, status }) {
  const entry = {
    id: uid(),
    deptId,
    kpiId:  kpiId  || '',
    author: author || (role === 'ai' ? 'Mark' : 'You'),
    role:   role   || 'human',
    kind:   kind   || 'note',
    text:   text   || '',
    status: status || 'nodata',
    ts: new Date().toISOString(),
  };
  const entries = load();
  entries.push(entry);
  save(entries);
  return entry;
}

/** Stored comments for a KPI, oldest → newest (reads as a thread). */
function getComments({ deptId, kpiId }) {
  return load()
    .filter(c => c.deptId === deptId && c.kpiId === kpiId)
    .sort((a, b) => a.ts.localeCompare(b.ts));
}

/** Count of stored comments on a KPI (excludes Mark's live lead note). */
function commentCount({ deptId, kpiId }) {
  return getComments({ deptId, kpiId }).length;
}

// ─── Mark's live "what's driving this" read ───────────────────────────────────

/**
 * composeMarkNote(kpi, rag) → string
 * Mark's grounded read of why the KPI is at its status. Prefers the KPI's own
 * story/flag data; otherwise a status-appropriate template. Green gets a
 * positive framing so "what's driving that green?" is always answered.
 */
function composeMarkNote(kpi, rag) {
  const parts = [];
  if (kpi.story && kpi.story.text) {
    parts.push(kpi.story.text.trim());
  } else if (kpi.flagDetail) {
    parts.push(String(kpi.flagDetail).trim());
  } else if (kpi.nodataNote) {
    // Real data-coverage caveat (e.g. "One real data point: Wk 9 …") — surface
    // it before falling back to the raw flag, so a thin-data KPI still reads.
    parts.push(String(kpi.nodataNote).trim());
  } else if (kpi.flag && typeof kpi.flag === 'string' && /\s/.test(kpi.flag) && kpi.flag.length < 240) {
    // Only render `flag` when it's actual prose (has whitespace) — never a raw
    // internal slug like "single_datapoint" / "actuals_missing".
    parts.push(kpi.flag.trim());
  }
  const grounded = parts.join(' ');

  if (rag === 'green') {
    return grounded
      ? `What's driving this green: ${grounded}`
      : `What's driving this green: actual is at or above the board-of-record target and the trend is holding. No open 8-step on the driving sub-KPIs — the standard work is being followed. I'm monitoring to sustain it.`;
  }
  if (rag === 'amber') {
    return grounded
      ? `Watching this — ${grounded}`
      : `At risk: slipping below target but not yet red. No confirmed root cause yet — I'm watching the driving sub-KPI's trend and will flag if it breaks red.`;
  }
  if (rag === 'red') {
    return grounded
      ? `Why it's red: ${grounded}`
      : `Below target. Root cause not yet confirmed — I recommend opening an 8-step on the sub-KPI that's driving the gap. I'll pre-draft steps 1–6 from the data.`;
  }
  return grounded || `No data connected yet — awaiting the source-system feed for this KPI.`;
}

// ─── Thread UI (shared by Overview + KPI Boards) ──────────────────────────────

function initials(name) {
  return String(name || '?').split(/[\s/—-]+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}
function shortTs(ts) {
  // ts is ISO; show as e.g. "Jul 3" without pulling in a date lib
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(ts || '');
  if (!m) return '';
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[+m[2] - 1]} ${+m[3]}`;
}

function renderStoredComment(c) {
  const isAi = c.role === 'ai';
  const av = isAi ? 'M' : initials(c.author);
  const kindTag = c.kind === 'action'
    ? '<span class="cmt__kind cmt__kind--action">action</span>' : '';
  return `
    <div class="cmt cmt--${isAi ? 'ai' : 'human'}">
      <span class="cmt__avatar cmt__avatar--${isAi ? 'ai' : 'human'}">${av}</span>
      <div class="cmt__body">
        <div class="cmt__meta">
          <span class="cmt__author">${esc(c.author)}${isAi ? ' · AI Employee' : ''}</span>
          ${kindTag}
          <span class="cmt__ts">${shortTs(c.ts)}</span>
        </div>
        <div class="cmt__text">${esc(c.text)}</div>
      </div>
    </div>`;
}

/** Inner HTML of the stored-comment list (re-rendered after each post). */
function renderCommentList(deptId, kpiId) {
  const stored = getComments({ deptId, kpiId });
  if (!stored.length) {
    return `<div class="cmt-empty">No notes yet — add the first, or ask Mark.</div>`;
  }
  return stored.map(renderStoredComment).join('');
}

/**
 * commentThreadHTML({ deptId, kpi, rag, author, collapsed })
 * Full thread block: Mark's live read + stored list + a post box.
 *   author   — display name attributed to human posts (session persona / dept lead)
 *   collapsed — start with the body hidden behind a toggle (used for green cards)
 *   markNote  — optional override for Mark's lead read (callers may pass a richer,
 *               dept-aware explanation; falls back to composeMarkNote otherwise)
 */
function commentThreadHTML({ deptId, kpi, rag, author, collapsed, markNote }) {
  const leadNote = (markNote && String(markNote).trim()) || composeMarkNote(kpi, rag);
  const count = commentCount({ deptId, kpiId: kpi.id });
  const bodyStyle = collapsed ? 'style="display:none"' : '';
  const toggleLabel = collapsed
    ? `💬 Notes${count ? ` (${count})` : ''} · ask Mark`
    : `💬 Notes${count ? ` (${count})` : ''}`;

  return `
    <div class="cmt-thread cmt-thread--${rag}" data-cmt-dept="${deptId}"
         data-cmt-kpi="${kpi.id}" data-cmt-status="${rag}"
         data-cmt-author="${esc(author || 'You')}">
      <button class="cmt-toggle" data-cmt-toggle="${kpi.id}">${toggleLabel}</button>
      <div class="cmt-body" data-cmt-body="${kpi.id}" ${bodyStyle}>
        <div class="cmt cmt--ai cmt--lead">
          <span class="cmt__avatar cmt__avatar--ai">M</span>
          <div class="cmt__body">
            <div class="cmt__meta">
              <span class="cmt__author">Mark · AI Employee</span>
              <span class="cmt__kind cmt__kind--driving">what's driving this</span>
            </div>
            <div class="cmt__text">${esc(leadNote)}</div>
          </div>
        </div>
        <div class="cmt-list" data-cmt-list="${kpi.id}">
          ${renderCommentList(deptId, kpi.id)}
        </div>
        <div class="cmt-form">
          <textarea class="cmt-input" rows="2"
            placeholder="Leave a note — e.g. &quot;Looking into it, report back Fri&quot;"></textarea>
          <button class="cmt-post" type="button">Post note</button>
        </div>
      </div>
    </div>`;
}

/**
 * bindComments(rootEl) — one delegated handler for all threads under rootEl.
 * Idempotent: safe to call after every re-render (guards with a dataset flag).
 * Reads deptId / kpiId / author from the thread's data attributes, so it works
 * for both Overview (author = persona) and KPI Boards (author = dept lead).
 */
function bindComments(rootEl) {
  if (!rootEl || rootEl.__fmdsCmtBound) return;
  rootEl.__fmdsCmtBound = true;

  rootEl.addEventListener('click', (e) => {
    const toggle = e.target.closest('.cmt-toggle');
    if (toggle && rootEl.contains(toggle)) {
      const id = toggle.getAttribute('data-cmt-toggle');
      const body = rootEl.querySelector(`.cmt-body[data-cmt-body="${id}"]`);
      if (body) body.style.display = (body.style.display === 'none') ? '' : 'none';
      return;
    }

    const post = e.target.closest('.cmt-post');
    if (post && rootEl.contains(post)) {
      const thread = post.closest('.cmt-thread');
      if (!thread) return;
      const input = thread.querySelector('.cmt-input');
      const text = input ? input.value.trim() : '';
      if (!text) { if (input) input.focus(); return; }
      const deptId = thread.getAttribute('data-cmt-dept');
      const kpiId  = thread.getAttribute('data-cmt-kpi');
      const status = thread.getAttribute('data-cmt-status') || 'nodata';
      const author = thread.getAttribute('data-cmt-author') || 'You';
      addComment({ deptId, kpiId, author, role: 'human', kind: 'note', text, status });
      const list = thread.querySelector('.cmt-list');
      if (list) list.innerHTML = renderCommentList(deptId, kpiId);
      if (input) input.value = '';
      const toggleBtn = thread.querySelector('.cmt-toggle');
      if (toggleBtn) {
        const n = commentCount({ deptId, kpiId });
        toggleBtn.textContent = `💬 Notes (${n})`;
      }
    }
  });
}

// ─── Seed a couple of illustrative Mark ↔ human exchanges ──────────────────────

function seedDemoComments() {
  if (__ls.getItem(SEED_FLAG)) return;

  // Operations OTP (red) — the interactive loop: Mark's meeting-grounded read,
  // then Jim's tracking action, then Mark confirming it back for the roll-up.
  addComment({
    deptId: 'operations', kpiId: 'otp', role: 'ai', author: 'Mark', kind: 'note', status: 'red',
    text: 'Picked this up from last T3 (Jim + Ops) — Mexico was flagged as the driver. I\'ve pre-drafted an 8-step on the Mexico OTP sub-KPI (steps 1–6 seeded from KZ-346, the $40K short-code event) so the team starts at ~70%. It\'s waiting in Problem-Solving.',
  });
  addComment({
    deptId: 'operations', kpiId: 'otp', role: 'human', author: 'Jim Kozel', kind: 'action', status: 'red',
    text: 'Walking the short-code order-entry step with the Mexico team Thu AM to confirm exactly which standard broke. Will open the 8-step off the Mexico sub-KPI and report back at Monday roll-up.',
  });
  addComment({
    deptId: 'operations', kpiId: 'otp', role: 'ai', author: 'Mark', kind: 'note', status: 'red',
    text: 'Logged — I\'ll surface "root cause being confirmed Thu (Jim)" to the Leadership OS roll-up so the Chief of Staff sees this red is already being actioned, not just flagged.',
  });

  // Service main revenue (flagged roll-up) — Mark ties the data-quality bug to
  // the huddle context so the L2 lead sees performance vs. reporting are different.
  addComment({
    deptId: 'service', kpiId: 'rev_we', role: 'ai', author: 'Mark', kind: 'driving', status: 'amber',
    text: 'Read carefully: the shortfall shown is a reporting gap, not a performance gap. Team Noel\'s revenue ($13.73M) is tracked accurately in their own sheet but never rolls into the Data Base main (column BQ is empty). From JC\'s Tue huddle: Team JC quote volume recovered after the HubSpot dialer outage. Recommend the fix go to Ricardo, not an 8-step.',
  });

  __ls.setItem(SEED_FLAG, '1');
}

// Auto-seed on first import in the browser (browser-guarded so Node tests that
// import without a __ls global don't throw).
if (typeof __ls !== 'undefined') {
  try { seedDemoComments(); } catch { /* __ls unavailable */ }
}

;return { addComment, getComments, commentCount, composeMarkNote, renderCommentList, commentThreadHTML, bindComments, seedDemoComments };
})();

/* ==== lib/agent.js ==== */
__M["lib/agent.js"] = (function(){
/**
 * lib/agent.js — Agent panel: canned context-grounded replies + stub live relay
 *
 * Exports:
 *   bakedReply(deptId, intent, ctx) → string
 *   liveReply(deptId, intent, ctx)  → Promise<string>  (Ask Mark: tries the real
 *                                    backend agent first — POST /api/mark with
 *                                    {deptId, context: buildDeptContext(...),
 *                                    messages: ctx.messages} — and falls back to
 *                                    the scripted, context-grounded reply built
 *                                    from lib/context.js on ANY failure: no
 *                                    `fetch` global, a rejected/timed-out fetch,
 *                                    or a non-OK response. The fallback is exactly
 *                                    what this module produced before the backend
 *                                    existed, so keyless local dev and the
 *                                    CSP-locked hosted Artifact bundle (where
 *                                    fetch is shimmed to reject) behave identically
 *                                    to the pre-backend prototype.)
 *
 * Intents:
 *   'explain-red'  — why a KPI is red (context-grounded per dept)
 *   'draft-step'   — first-pass draft for an 8-step step (uses ctx.step, ctx.kpi)
 *   'find-sop'     — relevant SOP/BWI for the current KPI/department
 *   'ask'          — free-text Ask Mark chat (ctx.dept + ctx.question); routes to
 *                    the mentioned KPI when the question names one, otherwise
 *                    summarizes the department's current reds
 *   'step-help'    — proactive, per-step co-pilot suggestion for the docked panel
 *                    on the 8-step wizard (uses ctx.step, ctx.kpi/ctx.kpiActual/
 *                    ctx.kpiTarget, ctx.kz; ctx.question for the composer free-text
 *                    follow-up). Returns a structured object (not a plain string —
 *                    see stepHelpFor() below) so the panel can render per-idea
 *                    Add/Dismiss actions. liveReply short-circuits this intent to
 *                    bakedReply even when ctx.dept is supplied, since step-help
 *                    always needs the structured object, never grounded prose.
 */

const { buildDeptContext } = __M["lib/context.js"];
const { composeMarkNote } = __M["lib/comments.js"];

// ─── Context corpus ─────────────────────────────────────────────────────────

const DEPT_CONTEXT = {
  operations: {
    headline: 'OTP (On-Time %)',
    redStory: `WE OTP is red (0.863 Mar vs 0.985 target) primarily because Mexico is dragging the main.
Mexico ran 0.39–0.55 on weekly OTP from ~week 15 onward. Two compounding factors:
1. Denominator inflation — a Galls color program surge (1,917-sample backlog) was included in the OTP denominator, making the percentage look worse than absolute pieces alone would suggest.
2. Standard-work gap — the $40K short-code breakage on the Galls color remake run (KZ-346) produced preventable credits and further inflated the denominator.
Houston (0.977) and Norcross (0.955) remain near target. Canada (0.926) is amber.
Jim Kozel's open question: which part of the standard work broke? (See BWI: Short-Code Order Entry — operations-shortcode SOP.)`,
    sopId: 'operations-shortcode',
    sopTitle: 'Short-Code Order Entry — Standard Work for Remake Jobs',
    redKpi: 'OTP',
    redActual: 0.863,
    redTarget: 0.985,
  },
  finance: {
    headline: 'Cash Conversion',
    redStory: `Finance is currently frozen (Phase 2 — NetSuite sunset + restructure in progress).
The three active 8-step items address AR/billing discrepancies:
KZ-327 (AR Billing, P. Fernandez — closed), KZ-339 (Credit & Rebill, A. Gonzalez — closed),
KZ-340 (AR 8-Step, J. Kozel — 1/8 steps done, early stage).
The root cause pattern across both closed items: order-entry or onboarding errors producing credits.
No current headline KPI is live — await Phase 2 NetSuite data migration.`,
    sopId: null,
    sopTitle: null,
    redKpi: 'AR Discrepancies',
    redActual: null,
    redTarget: 0,
  },
  sales: {
    headline: 'Incoming Rev WE Outside',
    redStory: `Sales board-of-record target is $45,869/wk (live COO board cell BY/row25).
Weekly revenue is volatile — the 8-week series shows swings from $26K to $465K.
KZ-328 (Sales Approval, T. Morando) addresses the root cause: no standardized
new-account onboarding checklist → preventable order-entry errors → $95,163 in
December credits. Countermeasures (weekly cross-functional onboarding call,
standardized checklist, CRM logging) are in progress but behind (R-status).
KZ-303 (HP Quote-to-Order, Alison Diaco) tracks the Hero's Pride shortfall:
Sep gap $80,859 from lack of a quote-to-order follow-up process.`,
    sopId: 'service-prospecting',
    sopTitle: 'Prospecting & Quote Follow-Up Standard Work',
    redKpi: 'Incoming Rev WE Outside',
    redActual: 290841,
    redTarget: 45869,
  },
  hr: {
    headline: 'TRIR',
    redStory: `TRIR Feb spiked to 30.80 (target 0) — this is a real cached value and the most likely
explanation is a genuine safety-incident month, but confirm with Clarissa that it is not
a data-entry artifact. Jan was 1.03, Mar recovered to 1.20.
ADP does not expose a usable API — the agent-poke workflow pings the HR owner (Clarissa)
on Slack, validates the number, then posts to the board. Turnover (0.43%/mo vs 2.0% target)
and Satisfaction (4.42–4.61 vs 4.50 target) are within range.
No HR-specific 8-step is open in the tracker (HR tab was blank in workbook).`,
    sopId: null,
    sopTitle: null,
    redKpi: 'TRIR',
    redActual: 30.80,
    redTarget: 0,
  },
  odg: {
    headline: 'FMDS Adoption',
    redStory: `The headline gap: FMDS adoption 93.2% vs target 100%, but the sharper signal is
8-Step adoption at only 18.9% — meaning most departments are not yet running closed-loop
problem-solving to the 8-step standard. SRR (Standard Rate Review) is 8.3% overall;
Operations is the outlier at ~50%, all others near 0%.
ODG is the coaching department — Jim/Eric own the 8-step coaching cadence.
No specific ODG 8-step KZ is active; ODG tracks all other departments' KZs.`,
    sopId: null,
    sopTitle: null,
    redKpi: '8-Step Adoption',
    redActual: 0.189,
    redTarget: 1.0,
  },
  service: {
    headline: 'Incoming Rev WE',
    redStory: `Service board-of-record: Incoming Rev WE $252,661/wk (Power BI, this week actual).
Total (WE + HPI) is $289,416/wk. HPI sub-total is $36,755/wk.
Team JC is at $160,578/wk; Team Noel at $128,838/wk. CSAT WEI 4.94, HPI 4.62.
The "time-with-customer" metric is flagged — it is not directly in the board sheet;
it is sourced from Calls/Meetings counts, which can be inflated by short touchpoints.
No specific Service 8-step is active in the KZ tracker.`,
    sopId: 'service-prospecting',
    sopTitle: 'Prospecting & Quote Follow-Up Standard Work',
    redKpi: 'Incoming Revenue WE', // matches data/service.json KPI name so isHeadlineKpi fires when Service goes red
    redActual: 252661,
    redTarget: 252661,
  },
  marketing: {
    headline: 'WEI Total Leads Revenue',
    redStory: `Marketing board is illustrative — no live actuals connected yet (Phase 7).
Lead revenue and pipeline figures are pending Carlos's data integration.
Carlos's Hermes agent is the planned automation layer for this department.`,
    sopId: null,
    sopTitle: null,
    redKpi: 'WEI Total Leads Revenue',
    redActual: null,
    redTarget: null,
  },
  it: {
    headline: 'Uptime',
    redStory: `IT board is illustrative — uptime and ticket-closure actuals not yet live (Phase 7).
IT uses lower_better direction for ticket closure time (target 240 min; illustrative actual 200 min → green).
No IT-specific 8-step is open in the tracker (IT tab was blank in workbook).`,
    sopId: null,
    sopTitle: null,
    redKpi: 'Uptime',
    redActual: null,
    redTarget: 0.998,
  },
  logistics: {
    headline: 'WE Shipping Margin',
    redStory: `Logistics board is illustrative — shipping margin actuals not yet live (Phase 7).
Logistics KZ items in Operations tracker (e.g. KZ-330 Undelivered Packages,
KZ-349 Logistics Issues Feb, KZ-359 Shipment not delivered) are classified
under Operations deptId as they originate from Gabriela Lopez / E. Wang at the plant level.`,
    sopId: null,
    sopTitle: null,
    redKpi: 'WE Shipping Margin',
    redActual: null,
    redTarget: 0.52,
  },
};

// ─── 8-step draft templates ─────────────────────────────────────────────────

const STEP_DRAFTS = {
  1: (ctx) => {
    const { kpi = 'the KPI', deptId = '' } = ctx;
    const dc = DEPT_CONTEXT[deptId] || {};
    // Prefer the selected KPI's own actual/target (passed by the wizard) over dept-level context
    const actual = ctx.kpiActual !== undefined && ctx.kpiActual !== null ? ctx.kpiActual : dc.redActual;
    const target = ctx.kpiTarget !== undefined && ctx.kpiTarget !== null ? ctx.kpiTarget : dc.redTarget;
    return `Step 1 — Clarify the Problem (draft for ${kpi})

Ultimate Goal: Achieve and sustain ${kpi} at or above the ${target != null ? target : 'target'} threshold consistently.

Standard: ${target != null ? target : '[enter target]'} (board-of-record target).

Current Situation: ${actual != null ? actual : '[enter actual]'} (latest period actual).

Gap = Problem: ${actual != null && target != null ? `Actual (${actual}) is below target (${target}).` : '[actual minus target — quantify the gap]'}

Chart: Trend line showing actual vs target for the past 8 weeks. (Attach to this A3.)

[Review and edit the above before confirming — these are agent-drafted first-pass values.]`;
  },

  2: (ctx) => {
    const { kpi = 'the KPI', deptId = '' } = ctx;
    const dc = DEPT_CONTEXT[deptId] || {};
    return `Step 2 — Break Down the Problem (draft for ${kpi})

Stratify the gap by: location, time period, job type, product line, team.

${deptId === 'operations' ? `For OTP: Mexico location is the primary driver (0.39–0.55 weekly vs 0.985 target).
Norcross/Houston are near target. Breakdown: sample-type orders vs standard production orders.
Point of occurrence: Mexico plant — remake order entry (short-code routing step).` : ''}
${deptId === 'sales' ? `For Sales credits: December account-onboarding events (new customers set up without checklist).
Point of occurrence: Order-entry step when setting up a new account.` : ''}
${deptId !== 'operations' && deptId !== 'sales' ? `Identify: What (which metric sub-component), Where (which location/team/step), When (which period), Who (which owner/role).
Narrow to the single point of occurrence where the gap originates.` : ''}

Prioritized Problem at point of occurrence: [confirm after stratification]

[Review and edit before confirming.]`;
  },

  3: (ctx) => {
    const { kpi = 'the KPI', deptId = '' } = ctx;
    const dc = DEPT_CONTEXT[deptId] || {};
    const target = ctx.kpiTarget !== undefined && ctx.kpiTarget !== null ? ctx.kpiTarget : dc.redTarget;
    return `Step 3 — Objective (draft for ${kpi})

Do What: Increase / restore ${kpi} to target.

To What: ${target != null ? target : '[target value]'} (${kpi}).

By When: [Enter target date — recommended: end of current quarter or next review cycle].

Chart: Target line overlaid on the KPI trend — showing current gap and the improvement trajectory needed.

[Review and edit before confirming.]`;
  },

  4: (ctx) => {
    const { kpi = 'the KPI', deptId = '' } = ctx;
    return `Step 4 — Root Cause / 5-Whys + 6M Fishbone (draft for ${kpi})

Why 1: [Directly observable symptom — what you can see happening]
Why 2: [Why did Why 1 occur?]
Why 3: [Why did Why 2 occur?]
Why 4: [Why did Why 3 occur?]
Why 5: [Root systemic cause — the "bone" to treat]

6M Fishbone classification:
  Man      — [Is there a skill/knowledge/behavior gap?]
  Method   — [Is there a missing or unclear standard work step?]
  Machine  — [Is there a system/equipment issue?]
  Material — [Is there a material or input quality issue?]
  Environment — [Is there a workspace or external factor?]
  Measurement — [Is there a data/tracking issue?]

Root Cause (confirmed): [State the single systemic root cause supported by the 5-Whys and 6M analysis.]

${deptId === 'operations' ? `[Operations OTP hint: The T3 story points to Method — a missing/ambiguous standard work step for short-code selection on remake orders (Galls color program). Confirm by walking the actual order-entry process step by step.]` : ''}
${deptId === 'sales' ? `[Sales hint: The T3 story points to Method — no standardized new-account onboarding checklist or accountability for quote follow-up. Confirm: was there a standard and was it not followed, or was there no standard at all?]` : ''}

[Review and complete all 5-Whys before confirming.]`;
  },

  5: (ctx) => {
    const { kpi = 'the KPI', deptId = '' } = ctx;
    return `Step 5 — Brainstorm Countermeasures (draft for ${kpi})

Countermeasure Candidates (against the confirmed root cause):
  1. Create / update the standard work step that was missing or unclear.
  2. Train all affected staff on the updated process.
  3. Add a verification checkpoint (e.g. dual-entry check, supervisor sign-off) at the point of occurrence.
  4. Build a poka-yoke (error-proofing) into the system (e.g. dropdown validation, auto-alert).
  5. Schedule a recurring audit of the process at the point of occurrence (daily/weekly until stable).

Prioritization: [Select 1–3 countermeasures most likely to address the root cause quickly and sustainably. Mark each as Easy/Hard and Fast/Slow to implement.]

[Review and score countermeasures before confirming. Do not implement until Step 5 is confirmed.]`;
  },

  6: (ctx) => {
    const { kpi = 'the KPI', deptId = '' } = ctx;
    return `Step 6 — Action Register (draft for ${kpi})

| No. | Implementation Plan                        | Start Date | Due Date | Responsible | Status |
|-----|--------------------------------------------|------------|----------|-------------|--------|
| 1   | [Countermeasure 1 — specific action]        |            |          |             | R      |
| 2   | [Countermeasure 2 — specific action]        |            |          |             | R      |
| 3   | [Countermeasure 3 — verification step]      |            |          |             | R      |

Status key: R = Behind | Y = At Risk | G = On Track | C = Completed

[Fill in all columns before confirming. Status must be updated at each board meeting. Each row should be actionable enough for the Responsible person to execute without further clarification.]`;
  },

  7: (ctx) => {
    const { kpi = 'the KPI', deptId = '' } = ctx;
    const dc = DEPT_CONTEXT[deptId] || {};
    const actual = ctx.kpiActual !== undefined && ctx.kpiActual !== null ? ctx.kpiActual : dc.redActual;
    const target = ctx.kpiTarget !== undefined && ctx.kpiTarget !== null ? ctx.kpiTarget : dc.redTarget;
    return `Step 7 — Monitor Results & Processes (draft for ${kpi})

Measurement — Start (baseline): ${actual != null ? actual : '[baseline actual at problem confirmation]'}

Measurement — End (result): [actual after implementing countermeasures — fill in at close]

New Target (if revised): ${target != null ? target : '[confirm target — unchanged unless root cause redefined the baseline]'}

KPI: ${kpi}

Chart — Actual vs Target: [Attach updated trend chart showing before/after countermeasure implementation. Use the same chart format as Step 3 to make comparison clear.]

[Monitor weekly until the metric is stable at or above target for at least 4 consecutive periods. Do not close until this condition is met.]`;
  },

  8: (ctx) => {
    const { kpi = 'the KPI', deptId = '' } = ctx;
    const dc = DEPT_CONTEXT[deptId] || {};
    return `Step 8 — Standardize Successful Process (draft for ${kpi})

Process Documents Created/Updated:
  - [BWI/SWI title] — [Created / Revised] — Link: [SharePoint / WMS]
  ${dc.sopId ? `- ${dc.sopTitle} (${dc.sopId}) — the governing SOP for this improvement.` : ''}
  - Submit WMS SW Update Request ticket: [ticket number]

Training on New Process(es):
  - Who was trained: [list names/roles]
  - When: [training date(s)]
  - Format: [in-person walk / video / on-the-job demo]

Yokoten Plan (cross-pollination):
  - Share improvement at: [next T3 board meeting / department all-hands]
  - Communicate to other locations: [Mexico / Norcross / Houston / Canada as applicable]
  - Document in ODG's 8-step tracker as "closed + shared"

Improvement Image or Chart:
  - Before/after visual confirming the process change. [Attach photograph or updated KPI chart.]

[Complete all sections before marking Step 8 confirmed. This step closes the KZ.]`;
  },
};

// ─── SOP lookup ─────────────────────────────────────────────────────────────

const SOP_LOOKUP = {
  operations: {
    id: 'operations-shortcode',
    title: 'Short-Code Order Entry — Standard Work for Remake Jobs',
    path: 'data/sops/operations-shortcode.json',
    linkedKpi: 'OTP',
    note: 'This BWI addresses the root cause of the Feb–Mar 2026 Galls color credit event (KZ-346). See Step 8 of any Operations remake-order 8-step.',
  },
  service: {
    id: 'service-prospecting',
    title: 'Prospecting & Quote Follow-Up Standard Work',
    path: 'data/sops/service-prospecting.json',
    linkedKpi: 'Incoming Rev WE',
    note: 'Governs the rep-level prospecting cadence and quote follow-up 3-touch rule.',
  },
  sales: {
    id: 'service-prospecting',
    title: 'Prospecting & Quote Follow-Up Standard Work',
    path: 'data/sops/service-prospecting.json',
    linkedKpi: 'Incoming Rev WE Outside',
    note: 'The same 3-touch rule applies to outside sales (Tony/Nick/Michael/Jamie). KZ-303 countermeasure #5 converts this to an LSW.',
  },
};

// ─── Agent-poke scripted beat (HR) ─────────────────────────────────────────

function agentPokeHR() {
  return `[Agent poke — ADP data validation]

Agent: "ADP does not expose a usable API. Pinging HR owner (Clarissa) on Slack now."

Slack DM → Clarissa:
  "Hi Clarissa — the FMDS board is missing this week's TRIR actual from ADP.
   Could you drop the number here so I can post it to the board? Thanks."

[Awaiting response…]

On receipt → validate: is the value numeric? Is it in the expected range (0–35)?
If Feb-style spike (>10): flag for review before posting — "TRIR spike detected. Confirm this is not a data-entry error before I post."
If confirmed: post to HR board TRIR row → status: G / Y / R as appropriate.

[This is a scripted demo of the ADP agent-poke flow. Live wiring is Phase 5b.]`;
}

// ─── Docked co-pilot: per-step proactive help ───────────────────────────────
// stepHelpFor() powers the 'step-help' intent for the docked Mark panel beside
// the 8-step wizard. Unlike bakedReply's other intents (which return plain
// strings for the chat drawer), 'step-help' returns a structured object so the
// panel can render one Add/Dismiss action per idea and write accepted text
// straight into the wizard's own fields:
//
//   { step, headline, note, items: [ {type, label, ...} ] }
//
// item.type is one of:
//   'chain'         — a candidate 5-Whys chain (step 4). { whys:[{n,text,category}], rootCause }
//   'altbranch'     — an alternative root-cause branch to test (step 4). { category, text }
//   'countermeasure'— a pre-scored countermeasure idea (step 5). { text, S,Q,C,T,Cu,Ef,OA }
//   'recovery'      — recovery-status framing for Results (step 7). { text }
//   'action'        — a suggested action-register row (step 6). { text }
//   'nudge'         — a brief grounded suggestion for a single field. { text, field }
//   'note'          — a plain scripted answer to a free-form composer question. { text }
//
// Every idea is scripted from DEPT_CONTEXT + the KPI passed in ctx — no network.

function genericWhyChain(kpiName, dc) {
  const hint = dc.redStory ? dc.redStory.split('\n')[0].trim() : `${kpiName} is off target.`;
  return [
    { n: 1, text: hint, category: 'Method' },
    { n: 2, text: `Confirm the exact process step where ${kpiName} actually breaks down (Genchi Genbutsu — go see it happen).`, category: 'Method' },
    { n: 3, text: `Check whether a standard exists for that step, and whether it's being followed.`, category: 'Man' },
    { n: 4, text: `If a standard exists, confirm it's followed consistently across owners/shifts/locations.`, category: 'Man' },
    { n: 5, text: `Root cause (hypothesis): a gap between the documented standard and what's actually happening at the point of occurrence.`, category: 'Method' }
  ];
}

function step4ChainFor(deptId, kpiName, dc) {
  if (deptId === 'operations') {
    return [
      { n: 1, text: `${kpiName} weekly actual runs well below target at the Mexico location (0.39–0.55 vs 0.985).`, category: 'Measurement' },
      { n: 2, text: 'The OTP denominator includes the Galls color program backlog (1,917 samples) alongside standard production.', category: 'Method' },
      { n: 3, text: 'Remake/backlog orders route through the same short-code order-entry flow as standard production orders.', category: 'Method' },
      { n: 4, text: 'The short-code order-entry standard work has no distinct path or exception handling for remake/sample jobs.', category: 'Method' },
      { n: 5, text: 'Root cause (hypothesis): a gap in the short-code order-entry standard work for remake-job routing and denominator classification.', category: 'Method' }
    ];
  }
  if (deptId === 'sales') {
    return [
      { n: 1, text: `${kpiName} shows large swings tied to December credit events ($95,163).`, category: 'Method' },
      { n: 2, text: 'The credits trace to new-account onboarding — accounts set up without a standard checklist.', category: 'Method' },
      { n: 3, text: 'No standardized new-account onboarding checklist exists for outside sales reps.', category: 'Method' },
      { n: 4, text: 'Without a checklist, order-entry errors on new accounts surface only after the fact, as a credit rather than a prevented error.', category: 'Man' },
      { n: 5, text: 'Root cause (hypothesis): missing standard work for new-account onboarding at the point of order entry.', category: 'Method' }
    ];
  }
  return genericWhyChain(kpiName, dc);
}

function altBranchesFor(deptId, kpiName) {
  if (deptId === 'operations') {
    return [
      { category: 'Man', text: 'Alternative: is this a training gap — do Mexico order-entry staff know how to flag remake/sample orders differently from standard production?' },
      { category: 'Measurement', text: 'Alternative: should backlog/sample pieces even count in the OTP denominator, or is the metric itself mis-defined for this program?' }
    ];
  }
  if (deptId === 'sales') {
    return [
      { category: 'Man', text: 'Alternative: is this a training/accountability gap for reps, rather than a missing checklist?' },
      { category: 'Measurement', text: 'Alternative: are credits being attributed to the right root event (onboarding vs. quote-to-order follow-up)?' }
    ];
  }
  return [
    { category: 'Man', text: `Alternative: is there a skill or training gap behind ${kpiName}, rather than a process gap?` },
    { category: 'Measurement', text: `Alternative: is ${kpiName} itself measured/sourced correctly, or could the number be a data artifact?` }
  ];
}

function step4Help(deptId, kpiName) {
  const dc = DEPT_CONTEXT[deptId] || {};
  const chain = step4ChainFor(deptId, kpiName, dc);
  const alts = altBranchesFor(deptId, kpiName);
  const rootCause = chain[chain.length - 1].text.replace(/^Root cause \(hypothesis\):\s*/i, '');
  return {
    step: 4,
    headline: `Candidate root-cause chain for ${kpiName}`,
    note: 'Hypotheses only — confirm each Why at the point of occurrence (Genchi Genbutsu) before locking the root cause.',
    items: [
      { type: 'chain', label: 'Add chain to Step 4', whys: chain, rootCause },
      ...alts.map(b => ({ type: 'altbranch', category: b.category, label: `Add as ${b.category} branch`, text: b.text }))
    ]
  };
}

function step5Help(deptId, kpiName) {
  const ideas = deptId === 'operations'
    ? [
        { text: "Add a distinct short-code path for remake/sample orders so they don't silently inflate the standard-production denominator.", S: 2, Q: 2, C: 1, T: 1, Cu: 2, Ef: 2, OA: 2 },
        { text: 'Daily Mexico OTP check-in until the metric is stable, tied to the short-code standard-work rollout.', S: 2, Q: 2, C: 2, T: 2, Cu: 2, Ef: 2, OA: 2 },
        { text: 'System validation (poka-yoke) flag on order entry whenever a remake/sample code is used.', S: 2, Q: 2, C: 0, T: 1, Cu: 2, Ef: 1, OA: 1 }
      ]
    : deptId === 'sales'
      ? [
          { text: 'Stand up a standardized new-account onboarding checklist before first order entry.', S: 2, Q: 2, C: 2, T: 1, Cu: 2, Ef: 2, OA: 2 },
          { text: 'Weekly cross-functional onboarding call to catch gaps before they become credits.', S: 2, Q: 2, C: 1, T: 2, Cu: 2, Ef: 2, OA: 2 },
          { text: 'CRM logging requirement so onboarding steps are auditable per account.', S: 1, Q: 2, C: 1, T: 1, Cu: 1, Ef: 1, OA: 1 }
        ]
      : [
          { text: `Daily/weekly check on ${kpiName} at the point of occurrence until it's stable.`, S: 2, Q: 2, C: 2, T: 2, Cu: 2, Ef: 2, OA: 2 },
          { text: 'Add a verification checkpoint (supervisor sign-off) before the process step completes.', S: 2, Q: 2, C: 1, T: 1, Cu: 2, Ef: 2, OA: 2 },
          { text: "Build a system validation so the error can't be entered in the first place.", S: 2, Q: 2, C: 0, T: 1, Cu: 2, Ef: 2, OA: 1 }
        ];
  return {
    step: 5,
    headline: `Pre-scored countermeasure ideas for ${kpiName}`,
    note: 'Scored 0–2 on Safety/Quality/Cost/Time/Customer/Effective. Treat Overall as a starting point — confirm with the team (Nemawashi) before locking it in.',
    items: ideas.map(i => ({ type: 'countermeasure', label: 'Add to matrix', ...i }))
  };
}

function step7Help(kpiName, actual, target) {
  const t = target != null ? target : 'target';
  const text = `Recovery status: watch ${kpiName} weekly and don't close this KZ until it is stable at or above ${t} for at least 4 consecutive periods.` +
    (actual != null ? ` Baseline at problem confirmation was ${actual}.` : '');
  return {
    step: 7,
    headline: `Recovery framing for ${kpiName}`,
    note: "Don't close Step 7 on a single good week — the standard is sustained stability, not a one-off.",
    items: [{ type: 'recovery', label: 'Add to Result Narrative', text }]
  };
}

function genericStepHelp(deptId, stepN, kpiName, actual, target) {
  const textByStep = {
    1: `Frame the gap in one line: "${kpiName} actual ${actual != null ? actual : '[actual]'} vs standard ${target != null ? target : '[target]'}."`,
    2: `Stratify before naming a prioritized problem — narrow ${kpiName} to the one location/team/step where the gap actually originates.`,
    3: `Set a By-When date you can defend at the next review — recommend end of the current review cycle for ${kpiName}.`,
    6: `Turn each scored countermeasure into one action row with a named owner and a real due date — a vague owner stalls at R (Behind).`,
    8: `Yokoten plan: name the other locations/teams that share this process and should hear about this fix.`
  };
  const fieldByStep = { 1: 'gap', 2: 'prioritizedProblem', 3: 'byWhen', 8: 'yokoten' };
  const text = textByStep[stepN] || `Keep this step grounded in ${kpiName} — cite the actual number, not a general statement.`;
  const item = stepN === 6
    ? { type: 'action', label: 'Add as action row', text }
    : { type: 'nudge', label: 'Add to field', field: fieldByStep[stepN] || null, text };
  return {
    step: stepN,
    headline: `Mark's nudge — Step ${stepN}`,
    note: null,
    items: [item]
  };
}

function answerQuestion(deptId, stepN, kpiName, question) {
  const dc = DEPT_CONTEXT[deptId] || {};
  const grounding = dc.redStory
    ? dc.redStory.split('\n')[0].trim()
    : `I don't have deeper scripted context beyond the ${kpiName} KPI data for this department.`;
  return `On ${kpiName} (Step ${stepN}): ${grounding}\n\n` +
    `(This composer answers from the same scripted context as the "Why is the headline KPI red?" shortcut. ` +
    `For anything beyond that, use the Ask Mark drawer or confirm on the floor.)`;
}

/**
 * stepHelpFor(deptId, stepN, ctx) → { step, headline, note, items }
 * ctx: { kpi (name or object via kpi.name), kpiActual, kpiTarget, question }
 */
function stepHelpFor(deptId, stepN, ctx = {}) {
  const dc = DEPT_CONTEXT[deptId] || {};
  const kpiObj = ctx.kpi && typeof ctx.kpi === 'object' ? ctx.kpi : null;
  const kpiName = (kpiObj && kpiObj.name) || (typeof ctx.kpi === 'string' ? ctx.kpi : null) || dc.redKpi || 'the KPI';
  const actual = ctx.kpiActual != null ? ctx.kpiActual : (kpiObj && kpiObj.actual != null ? kpiObj.actual : dc.redActual);
  const target = ctx.kpiTarget != null ? ctx.kpiTarget : (kpiObj && kpiObj.target != null ? kpiObj.target : dc.redTarget);

  if (ctx.question) {
    return {
      step: stepN,
      headline: `Re: "${ctx.question}"`,
      note: null,
      items: [{ type: 'note', text: answerQuestion(deptId, stepN, kpiName, ctx.question) }]
    };
  }

  switch (stepN) {
    case 4: return step4Help(deptId, kpiName);
    case 5: return step5Help(deptId, kpiName);
    case 7: return step7Help(kpiName, actual, target);
    default: return genericStepHelp(deptId, stepN, kpiName, actual, target);
  }
}

// ─── Main export: bakedReply ─────────────────────────────────────────────────

/**
 * bakedReply(deptId, intent, ctx) → string
 *
 * @param {string} deptId   — department id (e.g. 'operations')
 * @param {string} intent   — one of: 'explain-red' | 'draft-step' | 'find-sop' | 'agent-poke' | 'step-help'
 * @param {object} ctx      — optional context: { step: 1–8, kpi: 'OTP', kzNumber: 'KZ-325' }
 * @returns {string|object} — context-grounded canned reply; 'step-help' returns a
 *                            structured { step, headline, note, items } object (see stepHelpFor above)
 */
function bakedReply(deptId, intent, ctx = {}) {
  const dc = DEPT_CONTEXT[deptId];

  switch (intent) {
    case 'explain-red': {
      if (!dc) return `No context available for department "${deptId}".`;
      return `Why is ${ctx.kpi || dc.redKpi || 'the KPI'} red?\n\n${dc.redStory}`;
    }

    case 'draft-step': {
      const stepNum = parseInt(ctx.step, 10);
      if (!stepNum || stepNum < 1 || stepNum > 8) {
        return `draft-step requires ctx.step (1–8). Got: ${ctx.step}`;
      }
      const draftFn = STEP_DRAFTS[stepNum];
      if (!draftFn) return `No draft template for step ${stepNum}.`;
      return draftFn({ ...ctx, deptId });
    }

    case 'find-sop': {
      const sop = SOP_LOOKUP[deptId];
      if (!sop) {
        return `No SOP currently embedded for ${deptId}. Check data/sops/ for available documents, or consult the Standard Work view.`;
      }
      return `Governing SOP for ${deptId} / ${ctx.kpi || sop.linkedKpi}:

Title:  ${sop.title}
File:   ${sop.path}
Linked KPI: ${sop.linkedKpi}
Note:   ${sop.note}

Open the Standard Work view to see the full BWI (Main Step → Key Points → Reason format).`;
    }

    case 'agent-poke': {
      if (deptId === 'hr') return agentPokeHR();
      return `Agent poke is currently only scripted for HR (ADP data validation). Other departments use board-direct or Power BI sources.`;
    }

    case 'step-help': {
      const stepNum = parseInt(ctx.step, 10);
      if (!stepNum || stepNum < 1 || stepNum > 8) {
        return { step: ctx.step, headline: 'Mark', note: null, items: [{ type: 'note', text: `step-help requires ctx.step (1–8). Got: ${ctx.step}` }] };
      }
      return stepHelpFor(deptId, stepNum, ctx);
    }

    default:
      return `Unknown intent "${intent}". Available: explain-red | draft-step | find-sop | agent-poke | step-help`;
  }
}

// ─── Ask Mark: context-grounded chat helpers ────────────────────────────────
// These back liveReply's ctx.dept branch. Pure — no DOM, no fetch — so they
// stay unit-testable in plain Node alongside the rest of lib/agent.js.

/** First segment of a KPI name before any parenthetical, e.g. "OTP (On-Time %)" → "OTP". */
function shortName(name) {
  const m = /^([^(]+)/.exec(String(name == null ? '' : name));
  return (m ? m[1] : String(name == null ? '' : name)).trim();
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * findMentionedKpi(kpis, question) → matching kpi from buildDeptContext().kpis, or null.
 * Whole-word match against the KPI's id or its short (pre-parenthesis) name, so
 * "why is OTP red?" matches a kpi named "OTP (On-Time %)" but a generic question
 * like "what is red?" does not accidentally match on a stray word.
 *
 * When more than one KPI matches (e.g. both "OTP" and "OTP — Mexico" match a
 * question naming the Mexico sub-KPI, since "OTP" is itself a whole word inside
 * "OTP — Mexico"), prefer whichever MATCHED TOKEN is longest — not whichever
 * KPI's full display name happens to be longest — so the more specific match wins.
 */
function findMentionedKpi(kpis, question) {
  if (!question) return null;
  const q = String(question).toLowerCase();
  let match = null;
  let matchLen = 0;
  for (const kpi of kpis || []) {
    const id = String(kpi.id || '').toLowerCase();
    const short = shortName(kpi.name).toLowerCase();
    const idHit = id.length > 1 && new RegExp(`\\b${escapeRegExp(id)}\\b`, 'i').test(q);
    const shortHit = short.length > 1 && new RegExp(`\\b${escapeRegExp(short)}\\b`, 'i').test(q);
    const hitLen = Math.max(idHit ? id.length : 0, shortHit ? short.length : 0);
    if (hitLen > matchLen) {
      match = kpi;
      matchLen = hitLen;
    }
  }
  return match;
}

/** True when `kpi` is the department's headline red-story KPI (DEPT_CONTEXT corpus). */
function isHeadlineKpi(dc, kpi) {
  if (!dc || !dc.redKpi || !kpi) return false;
  const redKpi = String(dc.redKpi).toLowerCase();
  return shortName(kpi.name).toLowerCase() === redKpi || String(kpi.name || '').toLowerCase().includes(redKpi);
}

/** Most recent (max ts) entry of a list, or null. Tolerates missing/unsorted ts. */
function latestByTs(items) {
  if (!items || !items.length) return null;
  return items.slice().sort((a, b) => String(b.ts || '').localeCompare(String(a.ts || '')))[0];
}

/**
 * trailLines(deptCtx, kpiId) → string[]
 * The live "trail" Mark reads off this KPI — the floor reason log, the KPI
 * comment thread, and any open 8-step linked to it. Each is drawn from the
 * externally-owned stores threaded through buildDeptContext (reasons/comments/
 * kzRecords), so the reply reflects what a human sees on the board, not a
 * canned string. Omits any line whose source is absent.
 */
function trailLines(deptCtx, kpiId) {
  const lines = [];

  const reason = latestByTs((deptCtx.reasons || []).filter((r) => r.kpiId === kpiId));
  if (reason && reason.text) lines.push(`Latest floor note (${reason.author || 'rep'}): ${reason.text}`);

  const comment = latestByTs((deptCtx.comments || []).filter((c) => c.kpiId === kpiId));
  if (comment && comment.text) {
    const who = comment.author || (comment.role === 'ai' ? 'Mark' : 'team');
    lines.push(`Latest thread note (${who}): ${comment.text}`);
  }

  const kz = (deptCtx.kzRecords || []).find((k) => k.linkedKpiId === kpiId && !k.closed);
  if (kz && kz.kzNumber) lines.push(`Open 8-step: ${kz.kzNumber} (${kz.done}/8 steps).`);

  return lines;
}

/**
 * Grounded answer about one specific KPI: live rag/actual/target + Mark's own
 * note, then the live trail (floor note / thread note / open 8-step) read off
 * deptCtx, then — only when this red KPI is the dept's headline story — the
 * richer static corpus narrative.
 */
function replyForKpi(dept, dc, kpi, deptCtx) {
  const rawKpi = ((dept && dept.kpis) || []).find((k) => k.id === kpi.id) || {};
  const note = composeMarkNote(rawKpi, kpi.rag);
  const ragLabel = { red: 'red', amber: 'amber', green: 'green', nodata: 'not yet reporting data' }[kpi.rag] || kpi.rag;
  const lines = [`${kpi.name} is currently ${ragLabel}.`, note, `Owner: ${kpi.owner}.`];
  lines.push(...trailLines(deptCtx, kpi.id));
  if (dc && kpi.rag === 'red' && isHeadlineKpi(dc, kpi)) {
    lines.push(dc.redStory);
  }
  return lines.join('\n\n');
}

/** Grounded summary of every red KPI currently open in the department. */
function summarizeReds(deptCtx, dc) {
  const { reds, kpis, deptName } = deptCtx;
  if (!reds.length) {
    return `Good news — ${deptName} has no red KPIs right now. Everything tracked is at or above target.`;
  }
  const redKpis = kpis.filter((k) => reds.includes(k.id));
  const lines = redKpis.map((k) => {
    const trail = trailLines(deptCtx, k.id);
    const trailBit = trail.length ? ` — ${trail.join(' ')}` : '';
    return `• ${k.name} — ${k.explanation.why} (owner: ${k.owner})${trailBit}`;
  });
  let out = `You have ${reds.length} red${reds.length === 1 ? '' : 's'} right now in ${deptName}:\n${lines.join('\n')}`;
  // Only glue on the static headline narrative when a CURRENT red actually is
  // the headline/story KPI — otherwise (e.g. OTP green but PPLH reds) the story
  // would be hardcoded, not grounded.
  if (dc && dc.redStory && redKpis.some((k) => isHeadlineKpi(dc, k))) out += `\n\n${dc.redStory}`;
  return out;
}

/** Route a grounded ctx.dept question/intent to the right scripted answer. */
function groundedReply(deptId, intent, ctx, deptCtx) {
  const dc = DEPT_CONTEXT[deptId];

  let mentioned = null;
  if (ctx.kpi) {
    mentioned = deptCtx.kpis.find((k) => k.id === ctx.kpi || k.name === ctx.kpi) || null;
  }
  if (!mentioned) mentioned = findMentionedKpi(deptCtx.kpis, ctx.question);
  if (mentioned) return replyForKpi(ctx.dept, dc, mentioned, deptCtx);

  // Intents with no live-data shape of their own still use the static corpus.
  if (intent === 'find-sop' || intent === 'draft-step' || intent === 'agent-poke') {
    return bakedReply(deptId, intent, ctx);
  }

  // Default for 'ask' / 'explain-red' / an unmatched free-text question:
  // summarize the department's current reds and who owns them.
  return summarizeReds(deptCtx, dc);
}

const MARK_ENDPOINT = '/api/mark';
// Live E2E measured ~31s for a real Operations question (opus, medium effort,
// several tool round-trips) — 30s silently cut off real replies while the
// server kept spending. 90s gives honest headroom; streaming is the real fix.
const MARK_FETCH_TIMEOUT_MS = 90000;

/**
 * fetchLiveReply(deptId, context, messages) → Promise<string|null>
 *
 * POSTs to the Mark backend (server/mark_agent.py, via serve.py's
 * POST /api/mark) and resolves the reply text on success, or `null` on ANY
 * failure — this function never throws. Callers treat `null` as the sole
 * signal to fall back to the scripted reply. Failure modes covered:
 *   - no `fetch` global at all (older runtimes; some Node test contexts)
 *   - `fetch` present but rejecting (network error, or the CSP-locked hosted
 *     Artifact bundle where fetch is shimmed to reject every call)
 *   - non-OK status (e.g. 503 when ANTHROPIC_API_KEY is not set server-side,
 *     or 500 on an agent-loop error)
 *   - a malformed 200 body (missing/non-string `reply`)
 *   - a slow backend — aborted after MARK_FETCH_TIMEOUT_MS
 */
async function fetchLiveReply(deptId, context, messages) {
  if (typeof fetch !== 'function') return null;
  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), MARK_FETCH_TIMEOUT_MS) : null;
  try {
    const res = await fetch(MARK_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deptId, context, messages }),
      ...(controller ? { signal: controller.signal } : {}),
    });
    if (!res || !res.ok) return null;
    const data = await res.json();
    return data && typeof data.reply === 'string' ? data.reply : null;
  } catch {
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * liveReply(deptId, intent, ctx) → Promise<string>
 *
 * When ctx.dept is supplied, builds this department's live context
 * (lib/context.js buildDeptContext, now also threading ctx.responses — the
 * accountability response-lifecycle entries — so the backend's
 * get_response_status tool has real data) and tries the real backend agent
 * first (fetchLiveReply, above). On any failure it falls back to the same
 * grounded-but-scripted reply this module always produced, keyed off
 * ctx.question / intent / ctx.kpi — mentioning real live figures (actual,
 * target, owner) rather than generic text. When ctx.dept is absent, falls
 * back to bakedReply so existing callers (the agent drawer) are unaffected.
 */
async function liveReply(deptId, intent, ctx = {}) {
  // 'step-help' always returns stepHelpFor's structured {step,headline,note,items}
  // object for the docked wizard panel — never grounded prose, never worth a
  // network round-trip — so short-circuit to bakedReply here even when
  // ctx.dept is supplied (the wizard dock passes ctx.dept alongside
  // ctx.kpi/ctx.step).
  if (intent === 'step-help') return bakedReply(deptId, intent, ctx);
  if (!ctx.dept) return bakedReply(deptId, intent, ctx);
  const deptCtx = buildDeptContext(ctx.dept, {
    reasons: ctx.reasons,
    comments: ctx.comments,
    kzRecords: ctx.kzRecords,
    responses: ctx.responses,
  });
  const live = await fetchLiveReply(deptId, deptCtx, ctx.messages || []);
  if (live != null) return live;
  return groundedReply(deptId, intent, ctx, deptCtx);
}

// ─── Structured draft prefill (steps 1–6) ─────────────────────────────────────
// The 8-step wizard, opened on a RED SUB-KPI, presents an agent DRAFT the human
// reviews & edits — not a blank form. draftStep() returns structured field values
// (not just narrative text) so each editable field can be pre-populated.
//
// The draft is grounded in three inputs (matching the Jul-3 design intent):
//   1. the red KPI's own data (name/actual/target/story)
//   2. a relevant SOP from the department's Standard Work (SOP_LOOKUP / sop-library)
//   3. a prior similar completed KZ (passed in as ctx.priorKZ) — its root cause,
//      countermeasures and actions seed the draft so the human starts at ~60–80%.

/**
 * draftStep(deptId, stepN, ctx) → { source, prefilled, fields }
 *   fields: object of { fieldKey: value } for steps 1,2,3,7,8
 *   For step 4: { whys:[{n,text,category}], rootCause }
 *   For step 5: { countermeasures:[{text,S,Q,C,T,Cu,Ef,OA}] }
 *   For step 6: { actionRows:[{no,plan,startDate,dueDate,responsible,status}], odgGate }
 *
 * ctx: { kpi, kpiActual, kpiTarget, kpiUnit, kpiStory, priorKZ, sop }
 *   priorKZ — a prior completed KZ record (with .content) to borrow structure from
 *   sop     — { id, title } governing SOP for this department/KPI
 */
function draftStep(deptId, stepN, ctx = {}) {
  const dc = DEPT_CONTEXT[deptId] || {};
  const kpi = ctx.kpi || dc.redKpi || 'the KPI';
  const actual = ctx.kpiActual != null ? ctx.kpiActual : dc.redActual;
  const target = ctx.kpiTarget != null ? ctx.kpiTarget : dc.redTarget;
  const prior = ctx.priorKZ && ctx.priorKZ.content ? ctx.priorKZ.content : null;
  const priorNum = ctx.priorKZ ? ctx.priorKZ.kzNumber : null;
  const sop = ctx.sop || SOP_LOOKUP[deptId] || null;
  const fmt = (v) => (v == null ? '' : String(v));

  const src = {
    kpi,
    priorKZ: priorNum,
    sop: sop ? sop.title : null,
    line: `Drafted from: red KPI "${kpi}"${actual != null && target != null ? ` (${actual} vs ${target})` : ''}` +
          (priorNum ? ` · prior similar KZ ${priorNum}` : '') +
          (sop ? ` · SOP "${sop.title}"` : '')
  };

  switch (stepN) {
    case 1: return {
      prefilled: true, source: src,
      fields: {
        ultimateGoal: `Ensure ${kpi} consistently meets standard — sustain customer satisfaction and trust.`,
        standard: target != null ? `${target} (board-of-record target)` : '',
        current: actual != null ? `${actual} (latest period actual)` : '',
        gap: actual != null && target != null ? `Actual ${actual} vs standard ${target} — this gap is the problem.` : '',
        chart: 'Actual-vs-target trend, last 8 periods (attach).'
      }
    };

    case 2: return {
      prefilled: true, source: src,
      fields: {
        stratification: deptId === 'operations'
          ? 'By location: Mexico is the primary driver (0.39–0.55 weekly vs target). Norcross/Houston near target. By job type: sample/remake orders vs standard production. Genchi Genbutsu → the remake order-entry (short-code) step.'
          : deptId === 'sales'
            ? 'By event: December new-account onboarding (accounts set up without a checklist). Genchi Genbutsu → the order-entry step when setting up a non-standard account.'
            : 'Break by what (metric sub-component) / where (location, team, step) / when (period) / who (owner). Go and see at the point of occurrence.',
        prioritizedProblem: prior ? prior.step2.prioritizedProblem : '[confirm the single prioritized problem after stratification]'
      }
    };

    case 3: return {
      prefilled: true, source: src,
      fields: {
        doWhat: prior ? `Eliminate the prioritized problem (cf. ${priorNum}: "${prior.step3.doWhat}")` : `Eliminate the prioritized problem driving ${kpi}`,
        toWhat: target != null ? `${target}` : (prior ? prior.step3.toWhat : '[target value]'),
        byWhen: '[end of current review cycle]',
        chart: 'Elimination of prioritized problem overlaid on the big-problem gap.'
      }
    };

    case 4: {
      // Highest-leverage, most-often-rejected step — seed a rigorous 5-Whys ladder.
      // Borrow the prior KZ's chain shape but flag every line for human confirmation.
      const cats = ['Man', 'Method', 'Machine', 'Material', 'Environment'];
      let whys;
      if (prior && prior.step4 && prior.step4.whys) {
        whys = prior.step4.whys.map((w) => ({
          n: w.n,
          text: `${w.text}  ← from ${priorNum}; confirm at the actual point of occurrence`,
          category: w.category
        }));
      } else {
        whys = cats.map((c, i) => ({
          n: i + 1,
          text: i === 0 ? `[Observable symptom in ${kpi}]` : `[Why did Why ${i} occur?]`,
          category: c
        }));
      }
      return {
        prefilled: true, source: src,
        whys,
        rootCause: prior && prior.step4 ? `${prior.step4.rootCause}  ← candidate from ${priorNum}; verify with Genchi Genbutsu before accepting` : '[state the single systemic root cause confirmed by the 5-Whys + 6M]',
        note: 'Step 4 is the highest-leverage step and the one most often rejected on review. Every drafted line is a hypothesis — walk the actual process (Genchi Genbutsu) and confirm or replace each before advancing.'
      };
    }

    case 5: {
      let cms;
      if (prior && prior.step5 && prior.step5.countermeasures) {
        cms = prior.step5.countermeasures.map((c) => ({ ...c }));
      } else {
        cms = [
          { text: 'Create / update the standard-work step that was missing or unclear', S: 2, Q: 2, C: 2, T: 1, Cu: 2, Ef: 2, OA: 2 },
          { text: 'Train all affected staff on the updated process', S: 2, Q: 2, C: 2, T: 1, Cu: 2, Ef: 2, OA: 2 },
          { text: 'Add a verification checkpoint (dual-entry / supervisor sign-off) at point of occurrence', S: 2, Q: 2, C: 1, T: 1, Cu: 2, Ef: 2, OA: 2 },
          { text: 'Build a poka-yoke (system validation / auto-alert)', S: 2, Q: 2, C: 0, T: 1, Cu: 2, Ef: 2, OA: 1 }
        ];
      }
      return {
        prefilled: true, source: src,
        countermeasures: cms,
        note: 'Score each 0–2 on Safety/Quality/Cost/Time/Customer/Effective, then set the Overall priority. Build consensus (Nemawashi) with all impacted stakeholders before committing.'
      };
    }

    case 6: {
      let rows;
      if (prior && prior.step6 && prior.step6.actionRows) {
        rows = prior.step6.actionRows.map((r) => ({ ...r, startDate: '', dueDate: '', status: 'R' }));
      } else {
        rows = [
          { no: 1, plan: '[Countermeasure 1 — specific action]', startDate: '', dueDate: '', responsible: '', status: 'R' },
          { no: 2, plan: '[Countermeasure 2 — specific action]', startDate: '', dueDate: '', responsible: '', status: 'R' },
          { no: 3, plan: '[Verification step]', startDate: '', dueDate: '', responsible: '', status: 'R' }
        ];
      }
      return {
        prefilled: true, source: src,
        actionRows: rows,
        odgGate: { status: 'pending', reviewer: 'Eric / Allison (ODG)', note: 'Submit this plan to the ODG gate for review before implementation begins.' }
      };
    }

    // Steps 7 & 8 are DO/CHECK/ACT — captured after implementation, not pre-drafted.
    default: return { prefilled: false, source: src, fields: {} };
  }
}

;return { bakedReply, liveReply, draftStep };
})();

/* ==== lib/charts.js ==== */
__M["lib/charts.js"] = (function(){
/**
 * lib/charts.js — inline SVG chart generators
 * Returns SVG strings; zero external dependencies.
 * RAG palette sourced from styles.css CSS variables (matched verbatim).
 */

const { ragStatus } = __M["lib/rag.js"];

// ─── Design-system colour tokens ───────────────────────────────────────────
// Prefer CSS custom properties so charts track the design system;
// hex fallbacks make unit tests and edge cases safe.
function _cssVar(name, fallback) {
  if (typeof document === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

const RAG_COLORS = {
  get green()  { return _cssVar('--green',  '#1f9d57'); },
  get amber()  { return _cssVar('--amber',  '#e07a12'); },
  get red()    { return _cssVar('--red',    '#d92d3a'); },
  get nodata() { return _cssVar('--slate-400', '#b6c0cd'); },
};
const ACCENT = { get value() { return _cssVar('--accent', 'hsl(166 28% 36%)'); } };
const SLATE  = {
  get 200() { return _cssVar('--slate-200', '#e3e8ef'); },
  get 300() { return _cssVar('--slate-300', '#d3dae4'); },
  get 600() { return _cssVar('--slate-600', '#59636f'); },
};

/**
 * svgLine(points, opts) → SVG string
 *
 * @param {Array<number|null>} points  — 1-D array of values (nulls = gap)
 * @param {object}  opts
 * @param {number}  [opts.target]     — optional horizontal target line
 * @param {number}  [opts.width=280]
 * @param {number}  [opts.height=72]
 * @param {string}  [opts.color]      — stroke colour; defaults to ACCENT
 * @param {boolean} [opts.mini=false] — suppress axes/labels
 */
function svgLine(points, opts = {}) {
  const {
    target  = null,
    width   = 280,
    height  = 72,
    color   = ACCENT.value,
    mini    = false,
  } = opts;

  const PAD_L = mini ? 4 : 28;
  const PAD_R = 8;
  const PAD_T = 8;
  const PAD_B = mini ? 4 : 24;

  const W = width  - PAD_L - PAD_R;
  const H = height - PAD_T - PAD_B;

  // Filter to numeric values for scale
  const numeric = points.filter(v => typeof v === 'number' && !Number.isNaN(v));
  if (numeric.length === 0) {
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <text x="${width / 2}" y="${height / 2}" text-anchor="middle" font-size="10" fill="${SLATE[600]}">no data</text>
    </svg>`;
  }

  let minV = Math.min(...numeric);
  let maxV = Math.max(...numeric);
  if (target !== null) {
    minV = Math.min(minV, target);
    maxV = Math.max(maxV, target);
  }
  if (maxV === minV) { maxV = minV + 1; } // avoid zero-range

  const scaleX = (i)  => PAD_L + (i / (points.length - 1 || 1)) * W;
  const scaleY = (v)  => PAD_T + H - ((v - minV) / (maxV - minV)) * H;

  // Build polyline segments (skip nulls as gaps)
  let segments = [];
  let current  = [];
  points.forEach((v, i) => {
    if (typeof v === 'number' && !Number.isNaN(v)) {
      current.push(`${scaleX(i).toFixed(1)},${scaleY(v).toFixed(1)}`);
    } else {
      if (current.length > 1) segments.push(current.join(' '));
      current = [];
    }
  });
  if (current.length > 1) segments.push(current.join(' '));

  // Dot positions for all numeric points
  const dots = points
    .map((v, i) => (typeof v === 'number' && !Number.isNaN(v))
      ? `<circle cx="${scaleX(i).toFixed(1)}" cy="${scaleY(v).toFixed(1)}" r="2.5" fill="${color}"/>`
      : '')
    .join('');

  // Target line
  const targetLine = target !== null
    ? `<line x1="${PAD_L}" y1="${scaleY(target).toFixed(1)}" x2="${PAD_L + W}" y2="${scaleY(target).toFixed(1)}"
           stroke="${RAG_COLORS.amber}" stroke-width="1" stroke-dasharray="4,3" opacity="0.85"/>`
    : '';

  // Y-axis labels (mini suppresses)
  let yLabels = '';
  if (!mini) {
    const fmt = (v) => {
      if (Math.abs(v) >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M';
      if (Math.abs(v) >= 1_000)     return (v / 1_000).toFixed(0) + 'k';
      return v.toFixed(v < 10 ? 1 : 0);
    };
    yLabels = [minV, maxV].map(v =>
      `<text x="${PAD_L - 3}" y="${scaleY(v).toFixed(1) - 0 + 3}" text-anchor="end" font-size="9" fill="${SLATE[600]}">${fmt(v)}</text>`
    ).join('');
  }

  const polylines = segments
    .map(pts => `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.75" stroke-linejoin="round" stroke-linecap="round"/>`)
    .join('');

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="none"/>
  ${targetLine}
  ${polylines}
  ${dots}
  ${yLabels}
</svg>`;
}

/**
 * svgBars(rows, opts) → SVG string
 *
 * @param {Array<{label:string, value:number|null, rag?:string}>} rows
 * @param {object} opts
 * @param {number} [opts.width=280]
 * @param {number} [opts.barHeight=20]
 * @param {number} [opts.gap=6]
 */
function svgBars(rows, opts = {}) {
  const {
    width     = 280,
    barHeight = 20,
    gap       = 6,
  } = opts;

  const PAD_L = 90;  // label area
  const PAD_R = 40;  // value area
  const PAD_T = 8;

  const trackW = width - PAD_L - PAD_R;
  const totalH = PAD_T + rows.length * (barHeight + gap);

  const numeric = rows
    .map(r => r.value)
    .filter(v => typeof v === 'number' && !Number.isNaN(v));

  const maxV = numeric.length ? Math.max(...numeric) : 1;

  const bars = rows.map((row, i) => {
    const y      = PAD_T + i * (barHeight + gap);
    const cx     = PAD_L;
    const cy     = y + barHeight / 2 + 4; // text baseline
    const val    = (typeof row.value === 'number' && !Number.isNaN(row.value)) ? row.value : null;
    const barW   = val !== null ? Math.max(2, (val / maxV) * trackW) : 0;
    const fill   = row.rag ? RAG_COLORS[row.rag] || SLATE[200] : VIZ.single;
    const valStr = val !== null
      ? (val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val.toFixed(1))
      : '—';

    return `
    <text x="${cx - 4}" y="${cy}" text-anchor="end" font-size="10" fill="${SLATE[600]}" dominant-baseline="middle"
          style="overflow:hidden;text-overflow:ellipsis">${row.label.slice(0, 14)}</text>
    <rect x="${cx}" y="${y}" width="${trackW}" height="${barHeight}" rx="3" fill="${SLATE[200]}"/>
    ${val !== null ? `<rect x="${cx}" y="${y}" width="${barW.toFixed(1)}" height="${barHeight}" rx="3" fill="${fill}" opacity="0.85"/>` : ''}
    <text x="${cx + trackW + 4}" y="${cy}" font-size="10" fill="${SLATE[600]}" dominant-baseline="middle">${valStr}</text>`;
  }).join('');

  return `<svg width="${width}" height="${totalH}" xmlns="http://www.w3.org/2000/svg">
  ${bars}
</svg>`;
}

// ─── Shared helpers for the charts below ───────────────────────────────────
// Factored out so svgRecoveryTrend/svgFunnel/svgPareto don't re-derive the
// "no data" placeholder or linear-interpolation math independently.

// "No data" placeholder — matches svgLine's empty-state markup verbatim.
function _noDataSvg(width, height) {
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <text x="${width / 2}" y="${height / 2}" text-anchor="middle" font-size="10" fill="${SLATE[600]}">no data</text>
    </svg>`;
}

// Linear interpolation: maps v from domain [d0,d1] onto range [r0,r1].
function _scale(v, d0, d1, r0, r1) {
  if (d1 === d0) return r0;
  return r0 + ((v - d0) / (d1 - d0)) * (r1 - r0);
}

// Escape text before inserting into an SVG <text> node so a label containing
// &, <, >, or " (e.g. a location/KPI name) can't break the markup.
function _escXml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * svgRecoveryTrend(points, opts) → SVG string
 *
 * Line chart for tracking a red-KPI's recovery toward target after a
 * countermeasure lands: trend line + dashed target line + a light green
 * "in-band" zone at/above target + a vertical dashed marker for when the
 * countermeasure went in + RAG-coloured dots per point (via `ragStatus`).
 *
 * @param {Array<number|null>} points   — 1-D array of values (nulls = gap)
 * @param {object}  opts
 * @param {number}  [opts.target]       — target value; drives dashed line, green band, dot colour
 * @param {number}  [opts.cmIndex]      — index of the point where the countermeasure went live
 * @param {string}  [opts.direction='higher_better'] — RAG direction for dot colour
 *                                        ('lower_better' inverts, e.g. safety/turnover KPIs)
 * @param {number}  [opts.width=280]
 * @param {number}  [opts.height=90]
 */
function svgRecoveryTrend(points, opts = {}) {
  const {
    target    = null,
    cmIndex   = null,
    direction = 'higher_better',
    width     = 280,
    height    = 90,
  } = opts;

  const PAD_L = 28;
  const PAD_R = 8;
  const PAD_T = 8;
  const PAD_B = 24;

  const W = width  - PAD_L - PAD_R;
  const H = height - PAD_T - PAD_B;

  const numeric = points.filter(v => typeof v === 'number' && !Number.isNaN(v));
  if (numeric.length === 0) return _noDataSvg(width, height);

  let minV = Math.min(...numeric);
  let maxV = Math.max(...numeric);
  if (target !== null) {
    minV = Math.min(minV, target);
    maxV = Math.max(maxV, target);
  }
  if (maxV === minV) { maxV = minV + 1; } // avoid zero-range

  const scaleX = (i) => PAD_L + _scale(i, 0, points.length - 1 || 1, 0, W);
  const scaleY = (v) => PAD_T + H - _scale(v, minV, maxV, 0, H);

  // Trend polyline segments (skip nulls as gaps), same pattern as svgLine.
  let segments = [];
  let current  = [];
  points.forEach((v, i) => {
    if (typeof v === 'number' && !Number.isNaN(v)) {
      current.push(`${scaleX(i).toFixed(1)},${scaleY(v).toFixed(1)}`);
    } else {
      if (current.length > 1) segments.push(current.join(' '));
      current = [];
    }
  });
  if (current.length > 1) segments.push(current.join(' '));
  const polylines = segments
    .map(pts => `<polyline points="${pts}" fill="none" stroke="${ACCENT.value}" stroke-width="1.75" stroke-linejoin="round" stroke-linecap="round"/>`)
    .join('');

  // Light green "in-band" (good) zone — ABOVE the target line for
  // higher_better metrics (higher values are good), BELOW it for
  // lower_better metrics (e.g. HR TRIR/turnover, target 0 — lower values are
  // good). Previously always shaded above target regardless of direction,
  // which read backwards for lower_better KPIs (the whole plot could shade
  // green while the dots were correctly red).
  let band = '';
  if (target !== null) {
    const bandTop    = direction === 'lower_better' ? scaleY(target) : PAD_T;
    const bandBottom = direction === 'lower_better' ? PAD_T + H : scaleY(target);
    band = `<rect x="${PAD_L}" y="${bandTop.toFixed(1)}" width="${W}" height="${Math.max(0, bandBottom - bandTop).toFixed(1)}" fill="${RAG_COLORS.green}" opacity="0.12"/>`;
  }

  // Dashed target line.
  const targetLine = target !== null
    ? `<line x1="${PAD_L}" y1="${scaleY(target).toFixed(1)}" x2="${PAD_L + W}" y2="${scaleY(target).toFixed(1)}"
           stroke="${RAG_COLORS.amber}" stroke-width="1" stroke-dasharray="4,3" opacity="0.9"/>`
    : '';

  // Vertical dashed "countermeasure in" marker.
  const cmMarker = (cmIndex !== null && cmIndex !== undefined && cmIndex >= 0 && cmIndex < points.length)
    ? `<line x1="${scaleX(cmIndex).toFixed(1)}" y1="${PAD_T}" x2="${scaleX(cmIndex).toFixed(1)}" y2="${PAD_T + H}"
           stroke="${SLATE[600]}" stroke-width="1" stroke-dasharray="2,2" opacity="0.7" data-marker="countermeasure"/>`
    : '';

  // Dots coloured per point via ragStatus (green/amber/red/nodata), honouring
  // the KPI's direction so lower_better metrics (safety TRIR, turnover) aren't
  // inverted (a rising TRIR must read red, not green).
  const dots = points
    .map((v, i) => {
      if (typeof v !== 'number' || Number.isNaN(v)) return '';
      const status = ragStatus(v, target, direction);
      const fill = RAG_COLORS[status] || ACCENT.value;
      return `<circle cx="${scaleX(i).toFixed(1)}" cy="${scaleY(v).toFixed(1)}" r="2.5" fill="${fill}"/>`;
    })
    .join('');

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="none"/>
  ${band}
  ${targetLine}
  ${cmMarker}
  ${polylines}
  ${dots}
</svg>`;
}

/**
 * svgFunnel(counts, opts) → SVG string
 *
 * Vertical bar funnel showing how many KZs (kaizen zones / affected items)
 * reach each step of the 8-step problem-solving process. Bars are RAG-graded
 * against the starting count (step 1), so a steep downstream drop-off reads
 * as red while steps still close to full reach read green.
 *
 * @param {Array<number|null>} counts   — reach count per step (typically 8-length)
 * @param {object}  opts
 * @param {string[]} [opts.labels]      — step labels; default D1..Dn
 * @param {number}  [opts.width=280]
 * @param {number}  [opts.height=140]
 */
function svgFunnel(counts, opts = {}) {
  const {
    labels = [],
    width  = 280,
    height = 140,
  } = opts;

  const PAD_L = 8;
  const PAD_R = 8;
  const PAD_T = 14;
  const PAD_B = 22; // room for step labels

  const numeric = counts.filter(v => typeof v === 'number' && !Number.isNaN(v));
  if (numeric.length === 0) return _noDataSvg(width, height);

  const n = counts.length;
  const W = width  - PAD_L - PAD_R;
  const H = height - PAD_T - PAD_B;

  const gap  = 4;
  const barW = Math.max(2, (W - gap * (n - 1)) / n);
  const maxV = Math.max(...numeric);
  // Charts use the viz palette only — never a RAG status hue as a bar fill.
  // Emphasize the step with the largest drop-off (the "story" in a retention
  // funnel) in the rust viz-accent; the rest render in the neutral viz single.
  let dropIdx = -1, maxDrop = -Infinity;
  for (let i = 1; i < counts.length; i++) {
    if (typeof counts[i] === 'number' && typeof counts[i - 1] === 'number') {
      const d = counts[i - 1] - counts[i];
      if (d > maxDrop) { maxDrop = d; dropIdx = i; }
    }
  }

  const bars = counts.map((v, i) => {
    const x    = PAD_L + i * (barW + gap);
    const val  = (typeof v === 'number' && !Number.isNaN(v)) ? v : null;
    const barH = val !== null ? Math.max(1, _scale(val, 0, maxV, 0, H)) : 0;
    const y    = PAD_T + (H - barH);
    const fill   = val === null ? VIZ.muted : (i === dropIdx ? VIZ.rust : VIZ.single);
    const label  = labels[i] != null ? String(labels[i]) : `D${i + 1}`;
    const valStr = val !== null ? String(val) : '—';

    return `
    <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${barH.toFixed(1)}" rx="2" fill="${fill}" opacity="0.85"/>
    <text x="${(x + barW / 2).toFixed(1)}" y="${Math.max(9, y - 3).toFixed(1)}" text-anchor="middle" font-size="8" fill="${SLATE[600]}">${valStr}</text>
    <text x="${(x + barW / 2).toFixed(1)}" y="${(height - 6).toFixed(1)}" text-anchor="middle" font-size="9" fill="${SLATE[600]}">${_escXml(label)}</text>`;
  }).join('');

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  ${bars}
</svg>`;
}

/**
 * svgPareto(rows, opts) → SVG string
 *
 * Pareto chart: svgBars-style horizontal bars, sorted descending by value,
 * overlaid with a cumulative-% polyline tracing the running total across
 * rows (classic 80/20 view of top contributors).
 *
 * Every input row gets exactly one bar (mirrors svgFunnel's one-mark-per-index
 * convention): valid values are sorted descending; null/non-numeric rows are
 * kept represented as zero-width "—" placeholders after the valid ones, so a
 * category with missing data never silently vanishes from the chart.
 *
 * @param {Array<{label:string, value:number|null}>} rows
 * @param {object} opts
 * @param {number} [opts.width=280]
 * @param {number} [opts.height]        — defaults to fit all rows
 * @param {number} [opts.barHeight=20]
 * @param {number} [opts.gap=6]
 */
function svgPareto(rows, opts = {}) {
  const {
    width     = 280,
    height    = null,
    barHeight = 20,
    gap       = 6,
  } = opts;

  const isNum = (v) => typeof v === 'number' && !Number.isNaN(v);

  if (!rows.some(r => isNum(r.value))) return _noDataSvg(width, height || 90);

  // One bar per input row: valid values descending first, null/non-numeric
  // rows kept (represented as placeholders) after them.
  const ordered = rows
    .map(r => ({ label: r.label, value: r.value, valid: isNum(r.value) }))
    .sort((a, b) => {
      if (a.valid && b.valid) return b.value - a.value;
      if (a.valid !== b.valid) return a.valid ? -1 : 1; // valid before placeholder
      return 0; // both placeholders: preserve input order (stable sort)
    });

  const PAD_L = 90; // label area
  const PAD_R = 40; // value area
  const PAD_T = 8;

  const trackW = width - PAD_L - PAD_R;
  const totalH = height || (PAD_T + ordered.length * (barHeight + gap));
  const validVals = ordered.filter(r => r.valid).map(r => r.value);
  const total  = validVals.reduce((s, v) => s + v, 0) || 1;
  const maxV   = validVals.length ? Math.max(...validVals) : 1;

  let running = 0;
  const cumPoints = [];

  const bars = ordered.map((row, i) => {
    const y   = PAD_T + i * (barHeight + gap);
    const cy  = y + barHeight / 2 + 4; // text baseline
    const val = row.valid ? row.value : null;
    // Zero-width placeholder bar for null/non-numeric rows (analogous to
    // svgFunnel's zero-height placeholder), so mark count == input length.
    const barW = val !== null ? Math.max(2, _scale(val, 0, maxV, 0, trackW)) : 0;

    // Cumulative % tracks only valid contributors.
    if (val !== null) {
      running += val;
      const cumPct = running / total;
      cumPoints.push(`${(PAD_L + cumPct * trackW).toFixed(1)},${(y + barHeight / 2).toFixed(1)}`);
    }

    const valStr = val !== null
      ? (val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val.toFixed(1))
      : '—';

    return `
    <text x="${PAD_L - 4}" y="${cy}" text-anchor="end" font-size="10" fill="${SLATE[600]}" dominant-baseline="middle">${_escXml(row.label.slice(0, 14))}</text>
    <rect x="${PAD_L}" y="${y}" width="${barW.toFixed(1)}" height="${barHeight}" rx="3" fill="${val !== null ? ACCENT.value : SLATE[200]}" opacity="0.85"/>
    <text x="${PAD_L + trackW + 4}" y="${cy}" font-size="10" fill="${SLATE[600]}" dominant-baseline="middle">${valStr}</text>`;
  }).join('');

  const cumLine = `<polyline points="${cumPoints.join(' ')}" fill="none" stroke="${ACCENT.value}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>`;
  const cumDots = cumPoints
    .map(p => {
      const [x, y] = p.split(',');
      return `<circle cx="${x}" cy="${y}" r="2" fill="${ACCENT.value}"/>`;
    })
    .join('');

  return `<svg width="${width}" height="${totalH}" xmlns="http://www.w3.org/2000/svg">
  ${bars}
  ${cumLine}
  ${cumDots}
</svg>`;
}

/* ═══════════════════════════════════════════════════════════════════════
 * Viz-palette chart helpers — dataviz spec (docs/redesign/DESIGN-GUIDE.md
 * §4), ported additively from docs/redesign/reference/charts.js for the
 * not-yet-rebuilt views (KPI Boards adaptive chart, 8-step A3 gap/pareto/
 * recovery charts) to consume once their own layout tasks land.
 *
 * 2px round-cap lines · area wash = series color @ 10% · grid = 1px SOLID
 * hairline (never dashed) · target = dashed 1px neutral line, left-anchored
 * label · endpoint dot ringed in the panel color · hover = crosshair + white
 * tooltip card. Colors resolve through the same getComputedStyle-backed
 * _cssVar() pattern as RAG_COLORS/ACCENT/SLATE above, so every value tracks
 * the --viz- and --surface- tokens — never a hardcoded hex, never blue
 * #3b82f6, never a status hue (--red/--green/--amber) as a line/series
 * color. (meter() below is the one deliberate exception: it's a status
 * meter, not a chart line, so it uses --red/--amber/--green by design —
 * same semantics as every existing .badge--red/.status-cell in this app.)
 * ═══════════════════════════════════════════════════════════════════════ */

const VIZ = {
  get single()      { return `hsl(${_cssVar('--viz-single', '197 13% 52%')})`; },
  get singleSoft()  { return `hsl(${_cssVar('--viz-single', '197 13% 52%')} / 0.10)`; },
  get rust()        { return `hsl(${_cssVar('--viz-2', '9 37% 56%')})`; },
  get rustSoft()    { return `hsl(${_cssVar('--viz-2', '9 37% 56%')} / 0.10)`; },
  get contextLine() { return `hsl(${_cssVar('--viz-7', '210 2% 49%')} / 0.45)`; },
  get muted()       { return `hsl(${_cssVar('--viz-7', '210 2% 49%')} / 0.35)`; },
  get grid()        { return `hsl(${_cssVar('--surface-11', '30 7% 6%')} / 0.07)`; },
  get target()      { return `hsl(${_cssVar('--surface-7a', '35 9% 37%')} / 0.55)`; },
  get panel()       { return _cssVar('--panel', '#ffffff'); },
};

/* Scale a 1-D series into {x,y,v,i} pixel points for a plot frame. Distinct
   from svgLine's inline scaleX/scaleY closures above — lineChart/stepChart/
   sparkline need the point objects themselves (not just a path string) for
   end-label placement, collision-nudge math, and the area-wash polygon. */
function _scalePts(series, w, h, pad, lo, hi) {
  const n = series.length;
  return series.map((v, i) => {
    const x = pad.l + (i / Math.max(1, n - 1)) * (w - pad.l - pad.r);
    const y = v == null ? null : pad.t + (1 - (v - lo) / (hi - lo || 1)) * (h - pad.t - pad.b);
    return { x, y, v, i };
  });
}

function _pathFromPts(pts) {
  let d = '';
  pts.forEach(p => { if (p.y == null) return; d += (d ? ' L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1); });
  return d;
}

/**
 * fmtVal(v, unit) → display string for a raw metric value. Shared by the
 * chart hover tooltips (wireChartHover) and sparkline hover labels.
 */
function fmtVal(v, unit) {
  if (v == null) return '—';
  if (unit === 'ratio') return (v * 100).toFixed(1) + '%';
  if (unit === '$/wk' || unit === '$' || unit === '$/mo') return '$' + Math.round(v).toLocaleString('en-US');
  if (unit === 'pcs/hr') return v.toFixed(1);
  if (unit === 'hrs') return v.toFixed(1) + ' hrs';
  if (unit === 'count') return String(v);
  if (unit === 'rate') return String(v);
  return typeof v === 'number' ? v.toLocaleString('en-US') : String(v);
}

/**
 * sparkline(series, opts) → SVG string — spec-compliant ~120×34 table/tile
 * trend line: area wash, dashed target, endpoint dot ringed in the panel
 * color. New export — no prior helper filled this role; the 20 existing
 * `svgLine(..., {mini:true})` call sites across views are untouched and
 * keep rendering exactly as before until their view's rebuild task swaps
 * them over.
 *
 * @param {Array<number|null>} series
 * @param {object} [opts]
 * @param {number} [opts.w=120]
 * @param {number} [opts.h=34]
 * @param {number} [opts.target]     — optional dashed reference line
 * @param {string} [opts.color]      — defaults to VIZ.single
 * @param {string} [opts.soft]       — area-wash color; defaults to VIZ.singleSoft
 * @param {string[]} [opts.labels]   — per-point labels for the hover tooltip
 * @param {string} [opts.fmt]        — unit passed to fmtVal on hover
 * @param {string} [opts.name]       — series name for aria-label / hover
 */
function sparkline(series, opts = {}) {
  const w = opts.w || 120, h = opts.h || 34;
  const color = opts.color || VIZ.single;
  const soft = opts.soft || VIZ.singleSoft;
  const vals = series.filter(v => v != null);
  if (!vals.length) return `<svg class="spark" width="${w}" height="${h}" aria-hidden="true"></svg>`;
  let lo = Math.min(...vals), hi = Math.max(...vals);
  if (opts.target != null) { lo = Math.min(lo, opts.target); hi = Math.max(hi, opts.target); }
  const span = (hi - lo) || Math.abs(hi) * 0.1 || 1;
  lo -= span * 0.12; hi += span * 0.12;
  const pad = { l: 2, r: 5, t: 3, b: 3 };
  const pts = _scalePts(series, w, h, pad, lo, hi);
  const d = _pathFromPts(pts);
  const last = [...pts].reverse().find(p => p.y != null);
  const area = d ? d + ` L${last.x.toFixed(1)} ${h - pad.b} L${pts[0].x.toFixed(1)} ${h - pad.b} Z` : '';
  let targetLine = '';
  if (opts.target != null) {
    const ty = pad.t + (1 - (opts.target - lo) / (hi - lo)) * (h - pad.t - pad.b);
    targetLine = `<line x1="${pad.l}" x2="${w - pad.r}" y1="${ty.toFixed(1)}" y2="${ty.toFixed(1)}" stroke="${VIZ.target}" stroke-width="1" stroke-dasharray="3 3"/>`;
  }
  const hover = opts.labels ? `data-spark='${_escXml(JSON.stringify({ s: series, labels: opts.labels, fmt: opts.fmt || 'raw', name: opts.name || '' }))}'` : '';
  return `<svg class="spark" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" ${hover} role="img" aria-label="${_escXml(opts.name || 'trend')}">
    ${area ? `<path d="${area}" fill="${soft}"/>` : ''}
    ${targetLine}
    <path d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${last.x.toFixed(1)}" cy="${last.y.toFixed(1)}" r="3" fill="${color}" stroke="${VIZ.panel}" stroke-width="2"/>
  </svg>`;
}

/**
 * lineChart(cfg) → SVG string — multi-series weekly-trend chart (e.g. OTP by
 * location). Direct end labels per series with vertical collision nudging;
 * a left-anchored dashed neutral target line labeled "Target N%" (left, not
 * right, so it never collides with the end labels); hover wiring via
 * `data-linechart` (see wireChartHover).
 *
 * Series colors — including which series is the emphasized "story" line vs.
 * a de-emphasized context line — are supplied by the caller via
 * `cfg.series[].color`; per-view rebuild tasks should source them from the
 * exported `VIZ` object (VIZ.single / VIZ.rust / VIZ.rustSoft /
 * VIZ.contextLine) so every chart keeps resolving through the token layer.
 * The swatch `.legend` block shown only for multi-series charts is
 * call-site markup built from `.legend`/`.legend__item`/`.legend__swatch`
 * (already ported into styles.css) — matching reference/view-kpi.js, which
 * builds it next to its `lineChart()` call rather than inside the SVG
 * generator itself; that per-view wiring is out of scope for this port.
 *
 * @param {object} cfg
 * @param {Array<{name:string,data:Array<number|null>,color:string,soft?:string,emphasis?:boolean}>} cfg.series
 * @param {string[]} cfg.xLabels
 * @param {number} [cfg.target]
 * @param {function} [cfg.fmtY]
 * @param {number} [cfg.w=760]
 * @param {number} [cfg.h=260]
 * @param {number} [cfg.yTicks=4]
 * @param {string} [cfg.fmt]    — unit forwarded through the hover payload to fmtVal
 * @param {string} [cfg.label] — aria-label
 */
function lineChart(cfg) {
  const w = cfg.w || 760, h = cfg.h || 260;
  const pad = { l: 44, r: 96, t: 14, b: 26 };
  let lo = Infinity, hi = -Infinity;
  cfg.series.forEach(s => s.data.forEach(v => { if (v != null) { lo = Math.min(lo, v); hi = Math.max(hi, v); } }));
  if (cfg.target != null) { lo = Math.min(lo, cfg.target); hi = Math.max(hi, cfg.target); }
  const span = hi - lo; lo -= span * 0.08; hi += span * 0.08;
  const yTicks = cfg.yTicks || 4;
  let grid = '', axis = '';
  for (let t = 0; t <= yTicks; t++) {
    const val = lo + (t / yTicks) * (hi - lo);
    const y = pad.t + (1 - t / yTicks) * (h - pad.t - pad.b);
    grid += `<line x1="${pad.l}" x2="${w - pad.r}" y1="${y}" y2="${y}" stroke="${VIZ.grid}" stroke-width="1"/>`;
    axis += `<text x="${pad.l - 8}" y="${y + 3.5}" text-anchor="end" class="chart-axis">${cfg.fmtY ? cfg.fmtY(val) : Math.round(val)}</text>`;
  }
  const n = cfg.series[0].data.length;
  let xAxis = '';
  cfg.xLabels.forEach((lb, i) => {
    const x = pad.l + (i / (n - 1)) * (w - pad.l - pad.r);
    xAxis += `<text x="${x}" y="${h - 6}" text-anchor="middle" class="chart-axis">${_escXml(lb)}</text>`;
  });
  let targetLine = '';
  const endYs = [];
  if (cfg.target != null) {
    const ty = pad.t + (1 - (cfg.target - lo) / (hi - lo)) * (h - pad.t - pad.b);
    targetLine = `<line x1="${pad.l}" x2="${w - pad.r}" y1="${ty}" y2="${ty}" stroke="${VIZ.target}" stroke-width="1" stroke-dasharray="4 4"/>
      <text x="${pad.l + 8}" y="${ty - 5}" class="chart-axis" style="font-weight:600">Target ${cfg.fmtY ? cfg.fmtY(cfg.target) : cfg.target}</text>`;
  }
  let lines = '', endLabels = '';
  cfg.series.forEach(s => {
    const pts = _scalePts(s.data, w, h, pad, lo, hi);
    const last = [...pts].reverse().find(p => p.y != null);
    lines += `<path d="${_pathFromPts(pts)}" fill="none" stroke="${s.color}" stroke-width="${s.emphasis ? 2.5 : 2}" stroke-linecap="round" stroke-linejoin="round" ${s.emphasis ? '' : 'opacity="0.85"'}/>`;
    if (s.emphasis) {
      const ptsArea = _pathFromPts(pts) + ` L${last.x.toFixed(1)} ${h - pad.b} L${pts[0].x.toFixed(1)} ${h - pad.b} Z`;
      lines = `<path d="${ptsArea}" fill="${s.soft || 'transparent'}"/>` + lines;
    }
    if (last) {
      lines += `<circle cx="${last.x}" cy="${last.y}" r="${s.emphasis ? 4 : 3}" fill="${s.color}" stroke="${VIZ.panel}" stroke-width="2"/>`;
      // Collision-nudged end labels — keep a running list of used y-positions
      // and push any label within 13px of an existing one further down.
      let ly = last.y;
      endYs.sort((a, b) => a - b).forEach(prev => { if (Math.abs(ly - prev) < 13) ly = prev + 13; });
      endYs.push(ly);
      endLabels += `<text x="${w - pad.r + 8}" y="${ly + 3.5}" class="chart-end-label" style="${s.emphasis ? 'font-weight:600' : ''}">${_escXml(s.name)} ${cfg.fmtY ? cfg.fmtY(last.v) : last.v}</text>`;
    }
  });
  const hoverData = _escXml(JSON.stringify({
    series: cfg.series.map(s => ({ name: s.name, data: s.data, color: s.color })),
    xLabels: cfg.xLabels, fmt: cfg.fmt || 'ratio',
    pad, w, h, lo, hi,
  }));
  return `<div class="linechart-wrap"><svg class="linechart" viewBox="0 0 ${w} ${h}" data-linechart='${hoverData}' role="img" aria-label="${_escXml(cfg.label || 'line chart')}">
    ${grid}${axis}${xAxis}${targetLine}${lines}${endLabels}
    <line class="lc-crosshair" y1="${pad.t}" y2="${h - pad.b}" stroke="${VIZ.target}" stroke-width="1" style="display:none"/>
  </svg></div>`;
}

/**
 * stepChart(series, opts) → SVG string — the A3 gap/recovery chart: a solid
 * actual series plotted against a dashed target line, with an optional
 * dashed hollow-dot `projected` tail appended after a vertical
 * "countermeasure in" marker. Used both for the plain gap chart (Step 1 —
 * no `projected`) and the recovery chart (Step 7 — with `projected`).
 *
 * The `illustrative` caption badge that pairs with a projected/recovery
 * chart is call-site markup (see reference view-solve.js's `chartFig`
 * wrapper, which adds a `<figcaption class="chart-fig__cap">` with a
 * `badge badge--outline` reading "illustrative") — out of scope for this
 * port, which is the SVG generator only; the 8-step A3 view task (not yet
 * built) wires that wrapper using the already-ported `.chart-fig`/
 * `.chart-fig__cap` classes.
 *
 * @param {Array<number>} series           — actual values
 * @param {object} [opts]
 * @param {number} [opts.w=640]
 * @param {number} [opts.h=170]
 * @param {number} [opts.target]
 * @param {Array<number>} [opts.projected] — dashed hollow-dot tail after series
 * @param {string[]} [opts.xLabels]
 * @param {function} [opts.fmtY]
 * @param {string} [opts.label]            — aria-label
 */
function stepChart(series, opts = {}) {
  const w = opts.w || 640, h = opts.h || 170;
  const pad = { l: 46, r: 16, t: 14, b: 24 };
  const tail = opts.projected || [];
  const all = series.concat(tail);
  let lo = Math.min(...all), hi = Math.max(...all);
  if (opts.target != null) { lo = Math.min(lo, opts.target); hi = Math.max(hi, opts.target); }
  const span = (hi - lo) || 1; lo -= span * 0.1; hi += span * 0.1;
  const n = all.length;
  const X = i => pad.l + (i / Math.max(1, n - 1)) * (w - pad.l - pad.r);
  const Y = v => pad.t + (1 - (v - lo) / (hi - lo)) * (h - pad.t - pad.b);
  const fmt = opts.fmtY || (v => Math.round(v * 100) + '%');
  let grid = '', axis = '';
  for (let t = 0; t <= 3; t++) {
    const val = lo + (t / 3) * (hi - lo), y = Y(val);
    grid += `<line x1="${pad.l}" x2="${w - pad.r}" y1="${y}" y2="${y}" stroke="${VIZ.grid}" stroke-width="1"/>`;
    axis += `<text x="${pad.l - 8}" y="${y + 3.5}" text-anchor="end" class="chart-axis">${fmt(val)}</text>`;
  }
  let xAxis = '';
  (opts.xLabels || []).forEach((lb, i) => {
    if (i % Math.ceil(n / 10) !== 0 && i !== n - 1) return;
    xAxis += `<text x="${X(i)}" y="${h - 6}" text-anchor="middle" class="chart-axis">${_escXml(lb)}</text>`;
  });
  let targetLine = '';
  if (opts.target != null) {
    const ty = Y(opts.target);
    targetLine = `<line x1="${pad.l}" x2="${w - pad.r}" y1="${ty}" y2="${ty}" stroke="${VIZ.target}" stroke-width="1" stroke-dasharray="4 4"/>
      <text x="${pad.l + 8}" y="${ty - 5}" class="chart-axis" style="font-weight:600">Target ${fmt(opts.target)}</text>`;
  }
  const actualPts = series.map((v, i) => ({ x: X(i), y: Y(v) }));
  const dActual = actualPts.map((p, i) => (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' ');
  const area = dActual + ` L${actualPts[actualPts.length - 1].x.toFixed(1)} ${h - pad.b} L${actualPts[0].x.toFixed(1)} ${h - pad.b} Z`;
  let tailSvg = '', marker = '';
  if (tail.length) {
    const tp = tail.map((v, j) => ({ x: X(series.length + j), y: Y(v) }));
    const start = actualPts[actualPts.length - 1];
    const dTail = 'M' + start.x.toFixed(1) + ' ' + start.y.toFixed(1) + tp.map(p => ` L${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('');
    tailSvg = `<path d="${dTail}" fill="none" stroke="${VIZ.single}" stroke-width="2" stroke-dasharray="3 4" stroke-linecap="round"/>`
      + tp.map(p => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3" fill="${VIZ.panel}" stroke="${VIZ.single}" stroke-width="1.5"/>`).join('');
    marker = `<line x1="${start.x.toFixed(1)}" x2="${start.x.toFixed(1)}" y1="${pad.t}" y2="${h - pad.b}" stroke="${VIZ.target}" stroke-width="1" stroke-dasharray="2 3"/>
      <text x="${start.x.toFixed(1)}" y="${pad.t + 2}" text-anchor="middle" class="chart-axis" style="font-weight:600" dy="-2">countermeasure in</text>`;
  }
  const last = actualPts[actualPts.length - 1];
  return `<svg class="linechart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${_escXml(opts.label || 'actual vs target')}">
    ${grid}${axis}${xAxis}${targetLine}
    <path d="${area}" fill="${VIZ.singleSoft}"/>
    <path d="${dActual}" fill="none" stroke="${VIZ.single}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    ${tailSvg}${marker}
    <circle cx="${last.x.toFixed(1)}" cy="${last.y.toFixed(1)}" r="3.5" fill="${VIZ.single}" stroke="${VIZ.panel}" stroke-width="2"/>
  </svg>`;
}

/**
 * paretoBars(rows, opts) → SVG string — largest-first horizontal bars for
 * the 8-step A3's "where is the gap coming from" chart: the first (largest)
 * bar is rust (VIZ.rust), the rest are muted neutral gray, with value
 * labels at the bar end. Rows are expected pre-sorted largest-first by the
 * caller (matches reference/charts.js — row[0] always gets the emphasis
 * treatment regardless of its actual value).
 *
 * Distinct from the existing `svgPareto` export above (left untouched): that
 * one adds a cumulative-% polyline overlay for a classic 80/20 pareto and is
 * still used as-is; this is the plainer "gap contribution, largest first"
 * bar chart the A3 needs.
 *
 * @param {Array<{label:string, value:number}>} rows
 * @param {object} [opts]
 * @param {number} [opts.w=640]
 * @param {function} [opts.fmt]   — value label formatter; default "N.N pts"
 * @param {string} [opts.label]   — aria-label
 */
function paretoBars(rows, opts = {}) {
  const w = opts.w || 640, rowH = 34, pad = { l: 96, r: 60, t: 6, b: 6 };
  const h = pad.t + pad.b + rows.length * rowH;
  const max = Math.max(...rows.map(r => r.value), 0.0001);
  const fmt = opts.fmt || (v => (v * 100).toFixed(1) + ' pts');
  const bars = rows.map((r, i) => {
    const y = pad.t + i * rowH;
    const bw = Math.max(2, (r.value / max) * (w - pad.l - pad.r));
    const emphasized = i === 0;
    return `
      <text x="${pad.l - 10}" y="${y + rowH / 2 + 4}" text-anchor="end" class="chart-axis" style="${emphasized ? 'font-weight:600;fill:var(--text)' : ''}">${_escXml(r.label)}</text>
      <rect x="${pad.l}" y="${y + 7}" width="${bw.toFixed(1)}" height="${rowH - 14}" rx="4"
        fill="${emphasized ? VIZ.rust : VIZ.muted}"/>
      <text x="${pad.l + bw + 8}" y="${y + rowH / 2 + 4}" class="chart-axis" style="${emphasized ? 'font-weight:600;fill:var(--text)' : ''}">${fmt(r.value)}</text>`;
  }).join('');
  return `<svg class="linechart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${_escXml(opts.label || 'gap breakdown')}">${bars}</svg>`;
}

/**
 * meter(pct, tone) → HTML string — actual-vs-target status meter: a
 * severity fill on a same-ramp track. Uses --red/--amber/--green directly,
 * exactly like every other RAG status affordance in this app (`.badge--red`,
 * `.status-cell`, `.rag-chip--*`) — this is a status indicator, not a chart
 * line/series, so the "no status hue as a line color" rule does not apply
 * to it (see the file-header note above).
 *
 * @param {number} pct   — 0..1 fill fraction (clamped)
 * @param {'red'|'amber'|'green'} [tone]
 */
function meter(pct, tone) {
  const clamped = Math.max(0, Math.min(1, pct));
  const fill = tone === 'red' ? 'var(--red)' : tone === 'amber' ? 'var(--amber)' : 'var(--green)';
  const track = tone === 'red' ? 'var(--red-bg)' : tone === 'amber' ? 'var(--amber-bg)' : 'var(--green-bg)';
  return `<div class="meter" style="background:${track}"><span style="width:${(clamped * 100).toFixed(1)}%;background:${fill}"></span></div>`;
}

/**
 * wireChartHover(root, tipEl) → void — hover crosshair + tooltip wiring for
 * every `[data-spark]` and `[data-linechart]` element under `root`. Call
 * once after render. Tooltip = white card with a running-head label plus,
 * for line charts, one swatch+value row per series; sparklines get the same
 * tooltip with a single value.
 *
 * @param {ParentNode} root   — container to scope the query (e.g. the view's <el>)
 * @param {HTMLElement} tipEl — the tooltip card element (toggled via style.display, positioned via style.left/top)
 */
function wireChartHover(root, tipEl) {
  root.querySelectorAll('[data-spark]').forEach(svg => {
    const cfg = JSON.parse(svg.dataset.spark);
    svg.addEventListener('mousemove', e => {
      const r = svg.getBoundingClientRect();
      const i = Math.round(((e.clientX - r.left) / r.width) * (cfg.s.length - 1));
      const v = cfg.s[i];
      if (v == null) { tipEl.style.display = 'none'; return; }
      tipEl.innerHTML = `<span class="running-head">${_escXml(cfg.labels[i] || '')}</span>${_escXml(fmtVal(v, cfg.fmt))}`;
      tipEl.style.display = 'block';
      tipEl.style.left = Math.min(e.clientX + 12, innerWidth - 150) + 'px';
      tipEl.style.top = (e.clientY - 40) + 'px';
    });
    svg.addEventListener('mouseleave', () => { tipEl.style.display = 'none'; });
  });
  root.querySelectorAll('[data-linechart]').forEach(svg => {
    const cfg = JSON.parse(svg.dataset.linechart);
    const cross = svg.querySelector('.lc-crosshair');
    svg.addEventListener('mousemove', e => {
      const r = svg.getBoundingClientRect();
      const sx = cfg.w / r.width;
      const px = (e.clientX - r.left) * sx;
      const n = cfg.series[0].data.length;
      const frac = (px - cfg.pad.l) / (cfg.w - cfg.pad.l - cfg.pad.r);
      const i = Math.max(0, Math.min(n - 1, Math.round(frac * (n - 1))));
      const cx = cfg.pad.l + (i / (n - 1)) * (cfg.w - cfg.pad.l - cfg.pad.r);
      cross.setAttribute('x1', cx); cross.setAttribute('x2', cx);
      cross.style.display = '';
      const rows = cfg.series.map(s =>
        `<div class="tip-row"><span class="legend__swatch" style="background:${s.color}"></span>${_escXml(s.name)}<b class="tnum">${_escXml(fmtVal(s.data[i], cfg.fmt))}</b></div>`).join('');
      tipEl.innerHTML = `<span class="running-head">${_escXml(cfg.xLabels[i])}</span>${rows}`;
      tipEl.style.display = 'block';
      tipEl.style.left = Math.min(e.clientX + 14, innerWidth - 200) + 'px';
      tipEl.style.top = (e.clientY - 20) + 'px';
    });
    svg.addEventListener('mouseleave', () => { tipEl.style.display = 'none'; cross.style.display = 'none'; });
  });
}

;return { svgLine, svgBars, svgRecoveryTrend, svgFunnel, svgPareto, fmtVal, sparkline, lineChart, stepChart, paretoBars, meter, wireChartHover, VIZ };
})();

/* ==== lib/hoshin.js ==== */
__M["lib/hoshin.js"] = (function(){
/**
 * lib/hoshin.js — Hoshin (annual policy-deployment) data layer
 *
 * Pure, dependency-injectable reader over data/hoshin.json (see that file's
 * _meta for full extraction/zero-invented-data provenance). No __ls,
 * no fetch in the pure functions below — the caller passes the parsed hoshin
 * object in, so this stays unit-testable in plain Node.
 *
 * hoshin shape: { _meta, objectives: [{id, name, priorityTag}],
 *                 departments: { <deptId>: { block, functionalLead, activities: [...] } } }
 * activity shape: { hoshinPriority, objectiveId, objectiveIds?, activityPlan,
 *                    target, supportFunction, lead, timeline }
 */

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * objectives(hoshin) → [{id, name, priorityTag}]
 * The full WE 2026 objective list, in source order.
 */
function objectives(hoshin = {}) {
  return hoshin.objectives || [];
}

/**
 * activitiesFor(hoshin, deptId) → [activity]
 * That department's Hoshin activities; [] for an unknown dept or one whose
 * source block was entirely blank (e.g. finance).
 *
 * If the dept's own `activities` is empty but it carries an `aliasOf`
 * pointer (e.g. Service -> Sales, per owner direction 2026-07 — see
 * data/hoshin.json _meta.deptMapping.service), resolve through to the
 * aliased department's activities instead. This is a read-time fallback,
 * not a data copy — editing Sales's activities automatically updates what
 * Service sees, and data/hoshin.json stays an honest record of what the
 * source workbook actually said.
 */
function activitiesFor(hoshin = {}, deptId) {
  const dept = (hoshin.departments || {})[deptId];
  if (dept && dept.activities && dept.activities.length) return dept.activities;
  if (dept && dept.aliasOf) return activitiesFor(hoshin, dept.aliasOf);
  return [];
}

/**
 * functionalLeadFor(hoshin, deptId) → string|null
 * The block-level functional lead named in the source workbook; null if the
 * dept is unknown or the lead was never captured.
 */
function functionalLeadFor(hoshin = {}, deptId) {
  const dept = (hoshin.departments || {})[deptId];
  return (dept && dept.functionalLead) || null;
}

/**
 * objectiveRelations(hoshin, deptId) → [{objectiveId, name, relation}]
 *
 * Every objective, exactly once, tagged 'drives' when the department has at
 * least one activity whose objectiveId (or an entry in objectiveIds, for
 * compound-labeled activities) equals that objective — else 'supports'.
 * Powers the per-board Hoshin strip (drives = bold disk, supports = dim).
 * Departments with zero activities (unknown dept or a blank source block)
 * surface every objective as 'supports'.
 */
function objectiveRelations(hoshin = {}, deptId) {
  const activities = activitiesFor(hoshin, deptId);
  const driven = new Set();
  activities.forEach((a) => {
    if (a.objectiveId) driven.add(a.objectiveId);
    if (Array.isArray(a.objectiveIds)) {
      a.objectiveIds.forEach((id) => { if (id) driven.add(id); });
    }
  });

  return objectives(hoshin).map((o) => ({
    objectiveId: o.id,
    name: o.name,
    relation: driven.has(o.id) ? 'drives' : 'supports',
  }));
}

/**
 * loadHoshin() → Promise<hoshin object|null>
 * Browser-only convenience loader for view code — fetches data/hoshin.json.
 * Guarded so Node tests (no `fetch` global) never hit this path; they inject
 * a parsed fixture into the pure functions above instead.
 */
async function loadHoshin() {
  if (typeof fetch === 'undefined') return null;
  const res = await fetch('data/hoshin.json');
  return res.json();
}

;return { objectives, activitiesFor, functionalLeadFor, objectiveRelations, loadHoshin };
})();

/* ==== lib/reasons.js ==== */
__M["lib/reasons.js"] = (function(){
/**
 * lib/reasons.js — reason-log store
 *
 * In-memory + __ls-backed. Readable by the L2 view via
 * getReasonsByDept(deptId). Seeded with illustrative Diane entries on first load.
 *
 * Entry shape:
 *   { id, deptId, kpiId, entityId, author, text, status, ts }
 *   id:       string (crypto.randomUUID or Date.now fallback)
 *   deptId:   string  — e.g. 'sales'
 *   kpiId:    string  — e.g. 'calls'
 *   entityId: string  — rep kpi id, e.g. 'rep_michael'
 *   author:   string  — display name of the rep
 *   text:     string  — free-text reason note
 *   status:   'red' | 'amber' | 'green' | 'nodata'
 *   ts:       ISO 8601 string
 */

const LS_KEY    = 'fmds_reasons';
const SEED_FLAG = 'fmds_reasons_seeded';

function load() {
  try {
    return JSON.parse(__ls.getItem(LS_KEY) || '[]');
  } catch { return []; }
}

function save(entries) {
  try { __ls.setItem(LS_KEY, JSON.stringify(entries)); } catch { /* quota */ }
}

function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return String(Date.now()) + '-' + Math.random().toString(36).slice(2, 9);
}

function addReason({ deptId, kpiId, entityId, author, text, status }) {
  const entry = {
    id: uid(),
    deptId,
    kpiId:    kpiId    || '',
    entityId: entityId || '',
    author:   author   || '',
    text:     text     || '',
    status:   status   || 'nodata',
    ts: new Date().toISOString(),
  };
  const entries = load();
  entries.push(entry);
  save(entries);
  return entry;
}

function getReasons({ deptId, kpiId }) {
  return load()
    .filter(r => r.deptId === deptId && r.kpiId === kpiId)
    .sort((a, b) => b.ts.localeCompare(a.ts));
}

function getReasonsByEntity({ deptId, entityId }) {
  return load()
    .filter(r => r.deptId === deptId && r.entityId === entityId)
    .sort((a, b) => b.ts.localeCompare(a.ts));
}

function getReasonsByDept(deptId) {
  return load()
    .filter(r => r.deptId === deptId)
    .sort((a, b) => b.ts.localeCompare(a.ts));
}

function seedDemoReasons() {
  if (__ls.getItem(SEED_FLAG)) return;
  // Two illustrative Diane (Service / Team JC rep) entries — clearly demo data.
  // deptId: 'service', kpiId: 'rev_jc' (Team JC revenue), entityId: 'rep_diane'
  // These surface on the L2 Service Team Board when rev_jc or rev_total is expanded.
  addReason({
    deptId: 'service', kpiId: 'rev_jc', entityId: 'rep_diane',
    author: 'Diane',
    text: '3 quotes short — 2 accounts rescheduled to Thu, 1 no-show. Expect to catch up Fri AM.',
    status: 'amber',
  });
  addReason({
    deptId: 'service', kpiId: 'rev_jc', entityId: 'rep_diane',
    author: 'Diane',
    text: 'Quote volume dropped Mon–Tue: system outage on HubSpot dialer 9–11 AM both days. JC team impacted.',
    status: 'red',
  });
  __ls.setItem(SEED_FLAG, '1');
}

// Auto-seed on first import in the browser, so the L2 board has floor context
// even if the L1 My Day view was never opened. Browser-guarded so Node tests
// (which import this module without a __ls global) don't throw.
if (typeof __ls !== 'undefined') {
  try { seedDemoReasons(); } catch { /* __ls unavailable */ }
}

;return { addReason, getReasons, getReasonsByEntity, getReasonsByDept, seedDemoReasons };
})();

/* ==== lib/rollup.js ==== */
__M["lib/rollup.js"] = (function(){
function rollup(method, childValues = []) {
  const vals = childValues.filter(v => typeof v === 'number' && !Number.isNaN(v));
  if (method === 'sum') return vals.reduce((a, b) => a + b, 0);
  if (method === 'avg') return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  return null; // 'independent' + 'manual' are not derived from children
}

;return { rollup };
})();

/* ==== lib/store.js ==== */
__M["lib/store.js"] = (function(){
function createStore(initial = {}) {
  let state = initial; const subs = new Set();
  const notify = () => subs.forEach(fn => fn(state));
  return {
    get: () => state,
    set: (patch) => { state = { ...state, ...patch }; notify(); },
    update: (fn) => { state = fn(state); notify(); },
    subscribe: (fn) => { subs.add(fn); return () => subs.delete(fn); },
  };
}

;return { createStore };
})();

/* ==== views/askmark.js ==== */
__M["views/askmark.js"] = (function(){
/**
 * views/askmark.js — Ask Mark: chat-first workspace with a response modal
 *
 * renderAskMark(dept, mount, session)
 *
 * Layout ported from docs/redesign/reference/view-rest.js (Ask Mark) — §5.8 of
 * docs/redesign/DESIGN-GUIDE.md — a 34fr/66fr grid: left = the live red-KPI
 * "Needs response" queue (`.q-card`s) + a "Recent threads" list
 * (`.thread-item`s); right = a chat surface (thread header, scrollable
 * messages, docked composer) talking to Mark via `lib/agent.js` liveReply().
 * The old two-pane "response card sits beside the chat" layout is retired —
 * a KPI's response card is now a `.modal-panel` opened from its `.q-card`'s
 * "Open response card" affordance (spec §3 Modal: scrim + panel, header/body/
 * footer, dismiss via ×/Close/overlay-click/Escape).
 *
 * ALL data plumbing from the pre-rebuild version is preserved verbatim —
 * only the markup + the chat's data shape (one flat thread → many named
 * threads) changed:
 *   - lib/accountability.js: redKpisNeedingResponse (live red queue),
 *     getResponse/addResponse (the response store), advanceLifecycle/
 *     lifecycleView (the 6-stage lifecycle track), linkEightStep (8-step
 *     escalation), rollupSignal (header "N stalled · M responses logged").
 *   - lib/agent.js liveReply() — every chat send still gathers the same live
 *     context (reasons, per-KPI comments, kz-records.json), now also the
 *     dept's accountability responses (getResponsesByDept) and the active
 *     thread's message history, and calls it unchanged; liveReply itself
 *     decides whether to hit the real backend agent or fall back to the
 *     scripted reply.
 *   - The header's "N action required" / "M being actioned" pill math is
 *     still computed off the LIVE queue split by whether each red already
 *     has a submitted response (not off rollupSignal — see the split-queue
 *     note above renderPageHead()).
 *   - The `respond=<kpiId>` hash param (reserved in app.js's routing
 *     docstring for exactly this) now opens the response modal for that KPI
 *     on mount — deep-linkable, e.g. `#/dept/operations/mark?respond=otp_mexico`.
 *
 * What DID change, deliberately, because the old co-located layout no longer
 * exists once the response card becomes a modal (a modal blocks the page
 * behind it, so there's no simultaneous "type in the chat to fill the
 * response draft" surface anymore): the previous "answer via chat" shortcut
 * (typing a chat message while an unanswered response card was selected
 * dropped that text into the draft's Field 1) is removed. The response
 * form's own "Ask Mark to draft it" button covers the same grounded-draft
 * need; the chat composer is now a plain Q&A surface with Mark, matching the
 * reference's fully independent chat-vs-response-modal split.
 *
 * "Chat threads" are an in-view/session concern (never persisted — same as
 * the old single `_thread`, reset on every renderAskMark() call), just now a
 * named LIST of threads instead of one flat log, so multiple conversations
 * can coexist and be switched between via the left column's "Recent
 * threads" list. "+ New Chat" pushes a fresh thread (Mark's scripted
 * intro copy — not business data) to the front and makes it active; a
 * thread's title renames itself from the first message sent in it.
 */

const { redKpisNeedingResponse, rollupSignal, getResponse, addResponse, advanceLifecycle, lifecycleView, linkEightStep, getResponsesByDept } = __M["lib/accountability.js"];
const { liveReply } = __M["lib/agent.js"];
const { getReasonsByDept } = __M["lib/reasons.js"];
const { getComments, composeMarkNote } = __M["lib/comments.js"];
const { sparkline, stepChart, VIZ } = __M["lib/charts.js"];

// ─── State (module-level, reset each render — mirrors problemsolving.js) ────
let _dept          = null;
let _mount         = null;
let _session       = null;
let _queue         = [];    // live red-KPI queue, refreshed every doRender()
let _threads       = [];    // [{ id, title, titled, when, msgs:[{role,text,system?}] }]
let _activeThreadId = null;
let _sending       = false; // guards double-send while a liveReply is in flight
let _submitting    = false; // guards double-submit on the response modal — addResponse()
                             // + the needs8 escalation path both run before the re-render
                             // that swaps the form out, so a fast double-click could
                             // otherwise persist two entries (double-counting rollupSignal)
let _kzRecordsCache = null; // lazy-loaded data/kz-records.json, shared across sends
let _drafts        = {};    // in-progress (unsubmitted) response-form edits, keyed by
                             // `${deptId}:${kpiId}` (draftKey) — NOT bare kpiId: KPI ids
                             // collide across departments. Cleared per KPI once
                             // addResponse() persists it, reset entirely on renderAskMark().
let _modalKpiId    = null;  // kpiId whose response modal is open, or null
let _modalEditing  = false; // answered response modal only: showing the editable form
                             // (via "Edit Response") instead of the read-back

// Field-1 prompt — Mark adapts what "what's driving the red?" means per
// department. Generic fallback covers depts not called out in the spec table.
const CAUSE_PROMPT_BY_DEPT = {
  operations: 'which location / which standard-work step',
  service:    'which reps & accounts',
  marketing:  'which channel',
  hr:         'incident vs data-entry artifact',
};
function causePromptFor(deptId) {
  return CAUSE_PROMPT_BY_DEPT[deptId] || 'what specifically is driving this';
}

// ─── Small formatters ────────────────────────────────────────────────────────

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatVal(v, unit) {
  if (v == null) return '—';
  if (typeof v !== 'number') return String(v);
  if (unit && unit.includes('$')) {
    if (Math.abs(v) >= 1_000_000) return '$' + (v / 1_000_000).toFixed(2) + 'M';
    if (Math.abs(v) >= 1_000)     return '$' + (v / 1_000).toFixed(0) + 'k';
    return '$' + v.toLocaleString();
  }
  if (unit === 'ratio' || unit === 'percent' || unit === '%' || unit === 'pct') return (v * 100).toFixed(1) + '%';
  if (Math.abs(v) >= 1_000) return v.toLocaleString();
  return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

// Short "Mon D" date, same regex-on-ISO approach as lib/comments.js shortTs().
function formatDueDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
  if (!m) return '—';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[+m[2] - 1]} ${+m[3]}`;
}

// "Mon D" for TODAY — used for a freshly created thread's meta line. Real
// current date, not a fabricated one (mirrors accountability.js's own
// addDays(new Date().toISOString(), ...) pattern for real-time stamps).
function shortDateLabel(d = new Date()) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

function findKpi(dept, kpiId) {
  return (dept.kpis || []).find((k) => k.id === kpiId) || null;
}

// ─── Chart helpers (modal's "actual vs target" chart) ───────────────────────
// Same idiom as views/problemsolving.js's A3 chart figures (chartFig/
// stepChartFmtY) — kept local here since problemsolving.js doesn't export
// them, but grounded in the same real kpi.series/target/unit.

// A couple of departments store object-shaped series (marketing.json:
// [{week,date,target,actual}, ...]); most store a flat number array. Same
// normalization views/overview.js already applies for its sparklines.
function seriesNumbers(kpi) {
  const s = kpi && kpi.series;
  if (!Array.isArray(s)) return [];
  if (s.length && s[0] && typeof s[0] === 'object') {
    return s.map((pt) => (pt && typeof pt === 'object') ? (pt.actual ?? null) : pt);
  }
  return s;
}

function seriesLabels(kpi) {
  const s = kpi && kpi.series;
  if (Array.isArray(s) && s.length && s[0] && typeof s[0] === 'object') {
    return s.map((pt) => 'P' + (pt && pt.week != null ? pt.week : '?'));
  }
  return seriesNumbers(kpi).map((_, i) => 'P' + (i + 1));
}

function chartFmtY(kpi) {
  const u = kpi && kpi.unit;
  if (u === 'ratio' || u === 'percent' || u === '%' || u === 'pct') return (v) => (v * 100).toFixed(1) + '%';
  return (v) => formatVal(v, u);
}

function chartXLabels(n) {
  return Array.from({ length: n }, (_, i) => `P${i + 1}`);
}

function chartFigFor(kpi) {
  if (!kpi) return `<div class="muted" style="font-size:12.5px; padding:12px 0">No KPI data available.</div>`;
  const series = seriesNumbers(kpi).filter((v) => typeof v === 'number' && !Number.isNaN(v));
  if (!series.length) return `<div class="muted" style="font-size:12.5px; padding:12px 0">No trend series on file for ${esc(kpi.name)}.</div>`;
  const target = typeof kpi.target === 'number' ? kpi.target : undefined;
  const svg = stepChart(series, {
    w: 660, h: 130, target, xLabels: chartXLabels(series.length),
    label: `${kpi.name} actual vs target`, fmtY: chartFmtY(kpi),
  });
  return `<figure class="chart-fig">
    ${svg}
    <figcaption class="chart-fig__cap"><span>${esc(kpi.name)} — actual vs target, ${series.length} periods on file. The number this response answers for.</span></figcaption>
  </figure>`;
}

// ─── Queue lookups ───────────────────────────────────────────────────────────

function findQueueItem(kpiId) {
  return _queue.find((q) => q.kpiId === kpiId) || null;
}

// Resolves a "queue item" shape for the response modal even when the KPI has
// already recovered off the live board (e.g. reopened later via the
// `respond=` deep link, or the read-back of an old answered entry). Falls
// back to the KPI definition + the persisted response entry's own owner/
// dueDate — never invents a value the store doesn't have.
function modalItemFor(kpiId) {
  const queued = findQueueItem(kpiId);
  if (queued) return queued;
  const kpi = findKpi(_dept, kpiId);
  if (!kpi) return null;
  const resp = getResponse({ deptId: _dept.id, kpiId });
  return {
    kpiId,
    kpi: kpi.name,
    rag: 'red',
    owner: (resp && resp.owner) || '',
    dueDate: (resp && resp.dueDate) || null,
  };
}

// ─── Page head ───────────────────────────────────────────────────────────────
//
// Pill math: BOTH pills are computed off the LIVE red queue —
// redKpisNeedingResponse(dept) — split by whether each item already has a
// submitted response (getResponse(...).answered):
//   "N action required" — live reds with NO response yet.
//   "M being actioned"  — live reds that DO have a response (still red on
//                         the board, but an owner has answered).
// Neither pill reads rollupSignal(deptId) counts: rollupSignal summarizes
// *persisted* accountability entries, which can include ones that have since
// recovered off the live board, or that haven't yet reached the
// 'actionUnderway' stage rollupSignal's own beingActioned count requires —
// using it for the headline pills risked an answered-but-not-yet-underway
// red not moving out of "action required" the moment it's submitted.
// rollupSignal's stalled + answered counts still feed the page-head sub-line.
function renderPageHead(dept, unansweredCount, answeredCount, rollup) {
  return `
    <div class="page-head">
      <div style="display:flex; gap:16px; align-items:center">
        <div class="ai-note__avatar" style="width:44px; height:44px; font-size:18px">M</div>
        <div>
          <h1 style="font-size:24px">Mark</h1>
          <p class="page-head__sub">AI Employee · ${esc(dept.name)} · ${rollup.stalled} stalled · ${rollup.answered} response${rollup.answered === 1 ? '' : 's'} logged</p>
        </div>
      </div>
      <div class="page-head__side">
        <span class="badge badge--red"><span class="dot"></span>${unansweredCount} action required</span>
        <span class="badge badge--amber"><span class="dot"></span>${answeredCount} being actioned</span>
        <button type="button" class="btn btn--primary" id="new-chat">+ New Chat</button>
      </div>
    </div>`;
}

// ─── Left column: red-KPI queue + recent threads ────────────────────────────

function renderQueueCard(item, dept) {
  const kpi      = findKpi(dept, item.kpiId);
  const actual   = kpi ? formatVal(kpi.actual, kpi.unit) : '—';
  const target   = kpi ? formatVal(kpi.target, kpi.unit) : '—';
  const resp     = getResponse({ deptId: dept.id, kpiId: item.kpiId });
  const answered = !!(resp && resp.answered);
  const spark    = kpi ? sparkline(seriesNumbers(kpi), {
    w: 96, h: 28, target: kpi.target, name: `${kpi.name} trend`,
    labels: seriesLabels(kpi), fmt: kpi.unit, color: VIZ.rust, soft: VIZ.rustSoft,
  }) : '';

  return `
    <button type="button" class="q-card" data-kpi-id="${esc(item.kpiId)}" data-open-response>
      <div class="q-card__row">
        <span class="status-cell status-cell--red"><span class="dot"></span>${esc(item.kpi)}</span>
        ${answered ? '<span class="badge badge--green">✓ Answered</span>' : '<span class="badge badge--red">Respond</span>'}
      </div>
      <div class="q-card__row" style="align-items:flex-end">
        <span class="q-card__value tnum">${actual} <small>vs ${target}</small></span>
        ${spark}
      </div>
      <div class="q-card__meta">Due ${formatDueDate(item.dueDate)} · Owner ${esc(item.owner || 'Unassigned')} · <b style="color:var(--accent-text)">Open response card</b></div>
    </button>`;
}

function renderThreadItems(threads, activeId) {
  if (!threads.length) {
    return '<p class="muted" style="font-size:12.5px">No threads yet — start one below, or click + New Chat.</p>';
  }
  return threads.map((t) => {
    const n = t.msgs.length;
    return `
      <button type="button" class="thread-item${t.id === activeId ? ' is-active' : ''}" data-thread-id="${esc(t.id)}">
        <span class="thread-item__title">${esc(t.title)}</span>
        <span class="thread-item__meta">${esc(t.when)} · ${n} message${n === 1 ? '' : 's'}</span>
      </button>`;
  }).join('');
}

// The split (unanswered vs answered) still drives the header pills + each
// card's own badge; the queue itself renders as ONE "Needs response" list
// (spec §5.8), unanswered items first so the most urgent reds lead.
function renderLeftColumn(dept, queue) {
  const unanswered = [];
  const answered   = [];
  for (const item of queue) {
    const resp = getResponse({ deptId: dept.id, kpiId: item.kpiId });
    (resp && resp.answered ? answered : unanswered).push(item);
  }
  const ordered = unanswered.concat(answered);
  const queueHtml = ordered.length
    ? ordered.map((it) => renderQueueCard(it, dept)).join('')
    : '<p class="muted" style="font-size:12.5px">No reds needing a response right now.</p>';

  return `
    <div class="section-head" style="margin-top:0">
      <span class="running-head">Needs response</span>
      <span class="badge badge--neutral">${queue.length}</span>
    </div>
    <div style="display:grid; gap:8px">${queueHtml}</div>

    <div class="section-head"><span class="running-head">Recent threads</span></div>
    <div id="askmark-threads-list" style="display:grid; gap:8px">${renderThreadItems(_threads, _activeThreadId)}</div>`;
}

// ─── Right column: chat surface ─────────────────────────────────────────────

function renderChatMessage(msg) {
  if (msg.role === 'me') {
    return `<div class="msg msg--user"><div class="msg__bubble">${esc(msg.text)}</div></div>`;
  }
  // System confirmations (response logged / 8-step opened) render as a
  // sage-tinted bubble — same Mark avatar, distinct fill — so they read as
  // a receipt inline in the conversation rather than a normal reply.
  const sysStyle = msg.system ? ' style="background:hsl(var(--action-1)); border-color:hsl(var(--action-3))"' : '';
  return `
    <div class="msg">
      <div class="ai-note__avatar">M</div>
      <div class="msg__bubble"${sysStyle}><p>${esc(msg.text)}</p></div>
    </div>`;
}

function renderThreadMessages(thread) {
  if (!thread || !thread.msgs.length) {
    return `<div class="muted" style="margin:auto; font-size:13.5px; text-align:center; max-width:44ch">Ask Mark about this board — I reason over the live KPI numbers, the response trail, and the 8-step record.</div>`;
  }
  return thread.msgs.map(renderChatMessage).join('');
}

function renderChatCard(thread) {
  return `
    <section class="card chat-surface">
      <div class="chat-surface__head">
        <span class="running-head">Thread</span>
        <b style="font-size:13px">${esc(thread ? thread.title : 'Ask Mark')}</b>
      </div>
      <div class="chat__thread chat-surface__scroll" id="askmark-thread">${renderThreadMessages(thread)}</div>
      <div class="chat__composer" style="padding:12px 20px 20px; margin:0">
        <textarea class="input" rows="2" id="askmark-input" placeholder="Ask Mark about this board…" aria-label="Ask Mark about this board"></textarea>
        <button type="button" class="btn btn--primary" id="askmark-send" style="align-self:flex-end">Send</button>
      </div>
    </section>`;
}

// ─── Response modal (spec §3 Modal + §5.8) ──────────────────────────────────

// The lifecycle chip track. Fed a real persisted entry once one exists;
// before a response, a pseudo-entry with only 'detected' done stands in
// (detection isn't persisted until an owner responds — see
// lib/accountability.js module header). lifecycleView() flags done/current.
function renderLifecycleChips(entry) {
  const stages = lifecycleView(entry);
  return stages.map((s) => {
    const cls = s.done ? 'is-done' : (s.current ? 'is-now' : '');
    return `<span class="life-chip ${cls}">${s.done ? '✓ ' : ''}${esc(s.label)}</span>`;
  }).join('<span class="faint" style="padding:0 2px">›</span>');
}

// Read-back of an already-submitted response (all persisted, user-entered
// text escaped). needs8Step = Yes renders one of three states: a deep-link
// once the 8-step is actually opened (lifecycle.eightStepOpened.done), an
// explicit "Open 8-step" action when a KZ is linked/linkable but escalation
// hasn't happened yet (e.g. the seeded OTP entry), or plain "No" text.
function renderReadBackFields(resp) {
  const opened = !!(resp.lifecycle && resp.lifecycle.eightStepOpened && resp.lifecycle.eightStepOpened.done);
  let eightStep;
  if (!resp.needs8Step) {
    eightStep = 'No — one-off / data artifact';
  } else if (opened && resp.kzNumber) {
    eightStep = `Yes — <a href="#/dept/${esc(resp.deptId)}/solve?kpi=${esc(resp.kpiId)}&kz=${esc(resp.kzNumber)}" style="color:var(--accent-text); font-weight:600">Open ${esc(resp.kzNumber)} in Problem-Solving →</a>`;
  } else {
    eightStep = `Yes — <button type="button" class="btn btn--outline btn--sm" id="rc-open8step" data-kpi-id="${esc(resp.kpiId)}">Open 8-step →</button>`;
  }
  const field = (label, value) => `<div class="field"><span class="field__label">${label}</span><span class="field__value">${value}</span></div>`;
  return `
    <div class="field-list">
      ${field("What's driving the red?", esc(resp.cause) || '—')}
      ${field('What are you doing about it?', esc(resp.action) || '—')}
      ${field('Needs an 8-step?', eightStep)}
      ${field('When will you report back?', esc(resp.reportBackWhen) || '—')}
    </div>`;
}

// The fillable 4-field form — used for a brand-new (unanswered) response AND
// for re-opening an already-answered one via "Edit Response" (seeded from
// `resp` instead of a blank slate). Field 1 pre-drafts from Mark's grounded
// read (composeMarkNote) unless the owner already edited it (persisted in
// _drafts) or an existing resp supplies one.
function renderResponseFormFields(item, kpi, resp) {
  const draft  = getDraft(item.kpiId);
  const cause  = draft.cause       != null ? draft.cause       : (resp ? resp.cause  : composeMarkNote(kpi || {}, item.rag));
  const action = draft.action      != null ? draft.action      : (resp ? resp.action : '');
  const needs8 = draft.needs8Step  != null ? draft.needs8Step  : (resp ? !!resp.needs8Step : false);
  const report = draft.reportBackWhen != null ? draft.reportBackWhen : (resp ? (resp.reportBackWhen || '') : '');
  const prompt = causePromptFor(_dept.id);

  return `
    <div class="field-list">
      <div class="field">
        <span class="field__label">What's driving the red? <span class="faint" style="font-weight:500">${esc(prompt)}</span></span>
        <textarea class="input" id="rc-cause" rows="4">${esc(cause)}</textarea>
        <div style="display:flex; align-items:center; gap:8px">
          <button type="button" class="btn btn--outline btn--sm" id="rc-draft">Ask Mark to draft it</button>
          <span class="faint" style="font-size:11px">Mark pre-fills this from the KPI's grounded read.</span>
        </div>
      </div>

      <div class="field">
        <span class="field__label">What are you doing about it?</span>
        <textarea class="input" id="rc-action" rows="3" placeholder="The action you're taking…">${esc(action)}</textarea>
      </div>

      <div class="field">
        <span class="field__label">Does this need an 8-step?</span>
        <div class="seg" id="rc-needs8" style="width:fit-content">
          <button type="button" class="seg__item${needs8 ? ' is-on' : ''}" data-val="yes">Yes</button>
          <button type="button" class="seg__item${!needs8 ? ' is-on' : ''}" data-val="no">No</button>
        </div>
        <p class="muted" id="rc-esc-note" style="font-size:12px; margin-top:6px;${needs8 ? '' : ' display:none'}">Submitting will link or open a KZ (8-step) for this KPI.</p>
      </div>

      <div class="field">
        <span class="field__label">When will you report back?</span>
        <input type="text" class="input" id="rc-report" style="max-width:320px" placeholder="e.g. Next T3 review, or a date" value="${esc(report)}">
      </div>
    </div>`;
}

function renderResponseModal() {
  const kpiId = _modalKpiId;
  const item  = modalItemFor(kpiId);
  if (!item) return '';
  const kpi      = findKpi(_dept, kpiId);
  const actual   = kpi ? formatVal(kpi.actual, kpi.unit) : '—';
  const target   = kpi ? formatVal(kpi.target, kpi.unit) : '—';
  const resp     = getResponse({ deptId: _dept.id, kpiId });
  const answered = !!(resp && resp.answered);
  const showForm = !answered || _modalEditing;
  const trackEntry = answered ? resp : { lifecycle: { detected: { done: true, ts: null } } };

  const headerBadge = answered
    ? `<span class="badge badge--green">✓ Response submitted${resp.owner ? ` · ${esc(resp.owner)}` : ''}</span>`
    : `<span class="badge badge--red">Respond</span>`;

  const footerPrimary = showForm
    ? `<button type="button" class="btn btn--primary" id="rc-submit">Submit Response</button>`
    : `<button type="button" class="btn btn--primary" id="rc-edit">Edit Response</button>`;

  return `
    <div class="modal-overlay" data-modal-close></div>
    <div class="modal-panel" role="dialog" aria-modal="true" aria-label="Response card — ${esc(item.kpi)}">
      <div class="modal-panel__head">
        <div>
          <h3>${esc(item.kpi)}</h3>
          <span class="faint" style="font-size:12px">${actual} vs ${target} · Due ${formatDueDate(item.dueDate)} · Owner ${esc(item.owner || 'Unassigned')}</span>
        </div>
        <div style="display:flex; align-items:center; gap:10px">
          ${headerBadge}
          <button type="button" class="icon-btn" data-modal-close aria-label="Close response card">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4l8 8M12 4l-8 8"/></svg>
          </button>
        </div>
      </div>
      <div class="modal-panel__body">
        ${chartFigFor(kpi)}
        <span class="running-head">Response lifecycle</span>
        <div style="display:flex; align-items:center; flex-wrap:wrap; gap:4px; margin:8px 0 20px">${renderLifecycleChips(trackEntry)}</div>
        ${showForm ? renderResponseFormFields(item, kpi, resp) : renderReadBackFields(resp)}
      </div>
      <div class="modal-panel__foot">
        <button type="button" class="btn btn--secondary" data-modal-close>Close</button>
        ${footerPrimary}
      </div>
    </div>`;
}

// ─── Threads ─────────────────────────────────────────────────────────────────

function threadUid() {
  return 't-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
}

// `withGreeting` is only true for "+ New Chat" — the default landing thread
// created on mount starts empty (renderThreadMessages' own empty-state copy
// covers it), so no scripted text appears until the user asks for a fresh
// conversation. Either way `titled: false` means the thread's title still
// renames itself from the first message actually sent in it.
function newThread({ withGreeting = false } = {}) {
  return {
    id: threadUid(),
    title: withGreeting ? 'New thread' : 'Ask Mark',
    titled: false,
    when: shortDateLabel(),
    msgs: withGreeting
      ? [{ role: 'mark', text: 'New thread — ask me about any KPI on this board. I reason over the live numbers and the response trail.' }]
      : [],
  };
}

function activeThread() {
  return _threads.find((t) => t.id === _activeThreadId) || _threads[0] || null;
}

// ─── Draft state (unsubmitted response-form edits) ──────────────────────────

function draftKey(kpiId) { return `${_dept.id}:${kpiId}`; }
function getDraft(kpiId) { return _drafts[draftKey(kpiId)] || {}; }
function setDraft(kpiId, key, val) {
  const k = draftKey(kpiId);
  _drafts[k] = _drafts[k] || {};
  _drafts[k][key] = val;
}

// Mark (re)drafts field 1 from the KPI's grounded read (composeMarkNote), and
// suggests field 2 only when it's still empty.
function askMarkToDraft(kpiId) {
  const item = modalItemFor(kpiId);
  if (!item) return;
  const kpi   = findKpi(_dept, kpiId);
  const cause = composeMarkNote(kpi || {}, item.rag);
  const root  = document.getElementById('askmark-modal-root');
  const causeEl  = root && root.querySelector('#rc-cause');
  const actionEl = root && root.querySelector('#rc-action');

  if (causeEl) causeEl.value = cause;
  setDraft(kpiId, 'cause', cause);

  if (actionEl && !actionEl.value.trim()) {
    const suggestion = `Confirming ${causePromptFor(_dept.id)} with the owning team, then correcting the standard work. I'll open an 8-step if the cause needs structured problem-solving.`;
    actionEl.value = suggestion;
    setDraft(kpiId, 'action', suggestion);
  }
}

// Escalation: given field 3 = Yes, pick the KZ this response should link to.
// Prefers an EXISTING open KZ already tagged to this KPI (data/kz-records.json's
// linkedKpiId) so escalating a KPI that's already being worked doesn't spawn a
// duplicate 8-step — that's a REAL kzNumber, safe to display and deep-link to.
// Otherwise there is no real KZ record yet: rather than fabricate a
// timestamp-suffixed placeholder ID that never resolves to anything (the old
// bug — Ask Mark would promise a number that Problem-Solving could never
// look up, and silently mint a DIFFERENT blank wizard instead), we return
// null. Callers must not display a fake number; the honest promise is "an
// 8-step draft is available for this KPI" and the actual draft is minted
// live by views/problemsolving.js's `?kpi=<id>` handoff when the owner gets
// there.
function resolveKzNumber(kpiId, owner) {
  const records = _kzRecordsCache || [];
  const existingOpen = records.find(
    (r) => r.deptId === _dept.id && r.linkedKpiId === kpiId && !r.closed);
  return existingOpen ? existingOpen.kzNumber : null;
}

// Submit the 4 fields → persist + advance the lifecycle to 'responded', then
// (field 3 = Yes) resolve+link a KZ and advance to 'eightStepOpened' too,
// then a full doRender() so the queue card, header pills, lifecycle track,
// and the modal (now in its read-back state) all update together.
async function submitResponse(kpiId) {
  if (_submitting) return; // ignore re-entrant clicks until doRender() repaints the modal
  const root = document.getElementById('askmark-modal-root');
  const item = modalItemFor(kpiId);
  if (!root || !item) return;

  const causeEl  = root.querySelector('#rc-cause');
  const actionEl = root.querySelector('#rc-action');
  const reportEl = root.querySelector('#rc-report');
  const yesBtn   = root.querySelector('#rc-needs8 .seg__item[data-val="yes"]');
  const needs8   = !!(yesBtn && yesBtn.classList.contains('is-on'));

  const cause  = causeEl  ? causeEl.value.trim()  : '';
  const action = actionEl ? actionEl.value.trim() : '';
  const report = reportEl ? reportEl.value.trim() : '';

  // Light client-side validation: cause + action are the substance of a
  // response; report-back is nudged but optional.
  if (!cause)  { if (causeEl)  causeEl.focus();  return; }
  if (!action) { if (actionEl) actionEl.focus(); return; }

  // Set BEFORE the (possibly async, see needs8 below) work starts — the
  // needs8 branch awaits loadKzRecords(), which leaves a window before
  // doRender() swaps the form out for the read-back where a second click on
  // the still-visible Submit button would otherwise re-run this whole path.
  _submitting = true;
  const submitBtn = root.querySelector('#rc-submit');
  if (submitBtn) submitBtn.disabled = true;

  addResponse({
    deptId: _dept.id,
    kpiId,
    owner: item.owner || '',
    cause,
    action,
    needs8Step: needs8,
    kzNumber: null,            // resolved + linked just below when needs8
    reportBackWhen: report || null,
  });
  advanceLifecycle({ deptId: _dept.id, kpiId, stage: 'responded' });
  delete _drafts[draftKey(kpiId)];

  let kzNumber = null;
  if (needs8) {
    await loadKzRecords();
    kzNumber = resolveKzNumber(kpiId, item.owner);
    linkEightStep({ deptId: _dept.id, kpiId, kzNumber });
  }

  // Mark posts a confirmation into the currently active chat thread — the
  // "system confirmations" sage-tinted bubble (spec §5.8). Only names a real
  // KZ number when one actually exists (an existing open KZ); otherwise the
  // honest promise is "an 8-step draft is available" — no fake ID — which
  // now matches exactly what views/problemsolving.js's `?kpi=` handoff mints
  // live when the owner gets there.
  const thread = activeThread();
  if (thread) {
    thread.msgs.push({
      role: 'mark', system: true,
      text: needs8
        ? (kzNumber
            ? `Logged your response on ${item.kpi} and opened ${kzNumber} for it — head to Problem-Solving to work the 8-step. I'll roll "being actioned" up to the Leadership OS too.`
            : `Logged your response on ${item.kpi} — I've opened an 8-step draft for it. Head to Problem-Solving to work it. I'll roll "being actioned" up to the Leadership OS too.`)
        : `Logged your response on ${item.kpi}. I'll roll "being actioned" up to the Leadership OS so the Chief of Staff sees this red is being worked.`,
    });
  }

  _submitting = false;
  _modalEditing = false;
  doRender();
}

// Escalate an ALREADY-answered response whose needs8Step is Yes but hasn't
// opened its 8-step yet (the read-back's "Open 8-step →" button — e.g. the
// seeded OTP entry, which ships with a kzNumber but eightStepOpened left
// pending on purpose). Reuses the entry's own kzNumber if it already has one;
// otherwise resolveKzNumber() now returns null rather than a fake ID (see its
// comment) — so this also actually NAVIGATES to Problem-Solving's `?kpi=`
// handoff, which mints the real draft live. That's the fix for the old
// mismatch: Ask Mark used to just log a fake "opened <placeholder-id>"
// message and go nowhere, so the promised ID could never be found once the
// owner clicked through on their own. `&kz=<kzNumber>` is only appended when
// we resolved a REAL existing record, so the deep link never references a
// number that doesn't exist on file.
async function openEightStepForKpi(kpiId) {
  const resp = getResponse({ deptId: _dept.id, kpiId });
  if (!resp) return;
  let kzNumber = resp.kzNumber;
  if (!kzNumber) {
    await loadKzRecords();
    kzNumber = resolveKzNumber(kpiId, resp.owner);
  }
  linkEightStep({ deptId: _dept.id, kpiId, kzNumber });

  const kpi = findKpi(_dept, kpiId);
  const kpiName = (kpi && kpi.name) || kpiId;
  const thread = activeThread();
  if (thread) {
    thread.msgs.push({
      role: 'mark', system: true,
      text: kzNumber
        ? `Opened ${kzNumber} for ${kpiName} — head to Problem-Solving to work the 8-step.`
        : `I've opened an 8-step draft for ${kpiName} — head to Problem-Solving to work it.`,
    });
  }

  doRender();
  const kzParam = kzNumber ? `&kz=${encodeURIComponent(kzNumber)}` : '';
  location.hash = `#/dept/${_dept.id}/solve?kpi=${encodeURIComponent(kpiId)}${kzParam}`;
}

// ─── Data loaders ────────────────────────────────────────────────────────────

// data/kz-records.json holds every department's 8-step records; fetched once
// and cached module-wide, mirroring the lazy-load pattern in
// views/problemsolving.js.
async function loadKzRecords() {
  if (_kzRecordsCache) return _kzRecordsCache;
  try {
    const res = await fetch('data/kz-records.json');
    _kzRecordsCache = await res.json();
  } catch (e) {
    console.warn('Ask Mark: could not load data/kz-records.json', e);
    _kzRecordsCache = [];
  }
  return _kzRecordsCache;
}

// Flatten stored per-KPI comment threads across every KPI in this dept —
// cheap (__ls-backed, no network) and gives liveReply the same
// "what's driving this" trail a human would see on the KPI board.
function gatherDeptComments(dept) {
  return (dept.kpis || []).flatMap((k) => getComments({ deptId: dept.id, kpiId: k.id }));
}

// ─── Chat: send + repaint ────────────────────────────────────────────────────

// Shapes an in-view thread's msgs ({role:'me'|'mark', text, system?}) into the
// backend's conversation-history contract ({role:'user'|'assistant', content}).
// Drops the locally-injected "system confirmation" bubbles (submitResponse /
// openEightStepForKpi push these with system:true — they never came from the
// model, so replaying them as assistant turns would misrepresent the
// conversation to Claude) and drops any messages before the first real user
// turn (a greeted new thread opens with a scripted Mark intro; the Anthropic
// Messages API requires the first turn to be 'user', so a leading assistant
// turn would make every send on that thread fail server-side and silently
// fall back to the scripted reply instead of actually reaching Mark).
function toApiMessages(msgs) {
  const real = (msgs || []).filter((m) => !m.system);
  const firstUser = real.findIndex((m) => m.role === 'me');
  if (firstUser === -1) return [];
  return real.slice(firstUser).map((m) => ({
    role: m.role === 'me' ? 'user' : 'assistant',
    content: m.text,
  }));
}

function scrollThreadToBottom() {
  const el = document.getElementById('askmark-thread');
  if (el) el.scrollTop = el.scrollHeight;
}

// Re-render just the chat card + the recent-threads list (not the queue, not
// the modal) — used for thread switch / new chat / send, so the response
// modal (a separate overlay) is never disturbed by ordinary chat activity.
function repaintChatArea() {
  const chatHost = document.getElementById('askmark-chat-host');
  if (chatHost) chatHost.innerHTML = renderChatCard(activeThread());
  const threadsList = document.getElementById('askmark-threads-list');
  if (threadsList) threadsList.innerHTML = renderThreadItems(_threads, _activeThreadId);
  bindChatComposer();
  bindThreadItems();
  scrollThreadToBottom();
}

function switchThread(threadId) {
  if (threadId === _activeThreadId) return;
  _activeThreadId = threadId;
  repaintChatArea();
}

function handleNewChat() {
  const t = newThread({ withGreeting: true });
  _threads.unshift(t);
  _activeThreadId = t.id;
  repaintChatArea();
  const inputEl = document.getElementById('askmark-input');
  if (inputEl) inputEl.focus();
}

async function sendMessage() {
  const inputEl = document.getElementById('askmark-input');
  const sendBtn = document.getElementById('askmark-send');
  if (!inputEl || _sending) return;
  const question = inputEl.value.trim();
  if (!question) { inputEl.focus(); return; }
  const thread = activeThread();
  if (!thread) return;

  _sending = true;
  if (sendBtn) sendBtn.disabled = true;
  inputEl.value = '';
  if (!thread.titled) {
    thread.title = question.length > 42 ? question.slice(0, 42) + '…' : question;
    thread.titled = true;
  }
  thread.msgs.push({ role: 'me', text: question });
  repaintChatArea();

  try {
    const reasons   = getReasonsByDept(_dept.id);
    const comments  = gatherDeptComments(_dept);
    const kzRecords = await loadKzRecords();
    const responses = getResponsesByDept(_dept.id);
    const messages  = toApiMessages(thread.msgs);
    const reply = await liveReply(_dept.id, 'ask', { dept: _dept, question, reasons, comments, kzRecords, responses, messages });
    thread.msgs.push({ role: 'mark', text: reply });
  } catch (e) {
    console.warn('Ask Mark: liveReply failed', e);
    thread.msgs.push({ role: 'mark', text: 'Sorry — I hit an error pulling that context together. Try asking again.' });
  }

  _sending = false;
  repaintChatArea();
  const freshInput = document.getElementById('askmark-input');
  if (freshInput) freshInput.focus();
}

// ─── Modal open/close ────────────────────────────────────────────────────────

function onModalKeydown(e) {
  if (e.key === 'Escape') closeModal();
}

function paintModalRoot() {
  const root = document.getElementById('askmark-modal-root');
  if (!root) return;
  root.innerHTML = _modalKpiId ? renderResponseModal() : '';
  document.removeEventListener('keydown', onModalKeydown);
  if (_modalKpiId) {
    bindModal();
    document.addEventListener('keydown', onModalKeydown);
  }
}

function openModal(kpiId) {
  _modalKpiId = kpiId;
  _modalEditing = false;
  paintModalRoot();
}

function closeModal() {
  _modalKpiId = null;
  _modalEditing = false;
  paintModalRoot();
}

// ─── Bind ────────────────────────────────────────────────────────────────────

function bindModal() {
  const root = document.getElementById('askmark-modal-root');
  const kpiId = _modalKpiId;
  if (!root || !kpiId) return;

  root.querySelectorAll('[data-modal-close]').forEach((b) => b.addEventListener('click', closeModal));

  const editBtn = root.querySelector('#rc-edit');
  if (editBtn) editBtn.addEventListener('click', () => { _modalEditing = true; paintModalRoot(); });

  const causeEl  = root.querySelector('#rc-cause');
  const actionEl = root.querySelector('#rc-action');
  const reportEl = root.querySelector('#rc-report');
  if (causeEl)  causeEl.addEventListener('input',  () => setDraft(kpiId, 'cause', causeEl.value));
  if (actionEl) actionEl.addEventListener('input', () => setDraft(kpiId, 'action', actionEl.value));
  if (reportEl) reportEl.addEventListener('input', () => setDraft(kpiId, 'reportBackWhen', reportEl.value));

  const toggle = root.querySelector('#rc-needs8');
  if (toggle) {
    toggle.querySelectorAll('.seg__item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const yes = btn.dataset.val === 'yes';
        setDraft(kpiId, 'needs8Step', yes);
        toggle.querySelectorAll('.seg__item').forEach((b) => b.classList.toggle('is-on', b === btn));
        const note = root.querySelector('#rc-esc-note');
        if (note) note.style.display = yes ? '' : 'none';
      });
    });
  }

  const draftBtn = root.querySelector('#rc-draft');
  if (draftBtn) draftBtn.addEventListener('click', () => askMarkToDraft(kpiId));

  const submitBtn = root.querySelector('#rc-submit');
  if (submitBtn) submitBtn.addEventListener('click', () => submitResponse(kpiId));

  // Read-back state only: escalates an already-answered "needs8Step: Yes"
  // response that hasn't opened its 8-step yet.
  const open8Btn = root.querySelector('#rc-open8step');
  if (open8Btn) open8Btn.addEventListener('click', () => openEightStepForKpi(open8Btn.dataset.kpiId));
}

function bindChatComposer() {
  const sendBtn = document.getElementById('askmark-send');
  if (sendBtn) sendBtn.addEventListener('click', sendMessage);
  const inputEl = document.getElementById('askmark-input');
  if (inputEl) {
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
  }
}

function bindThreadItems() {
  const list = document.getElementById('askmark-threads-list');
  if (!list) return;
  list.querySelectorAll('[data-thread-id]').forEach((btn) => {
    btn.addEventListener('click', () => switchThread(btn.dataset.threadId));
  });
}

function attachHandlers() {
  _mount.querySelectorAll('[data-open-response]').forEach((card) => {
    card.addEventListener('click', () => openModal(card.dataset.kpiId));
  });
  const newChatBtn = document.getElementById('new-chat');
  if (newChatBtn) newChatBtn.addEventListener('click', handleNewChat);
  bindChatComposer();
  bindThreadItems();
}

// ─── Main render ──────────────────────────────────────────────────────────────

function doRender() {
  _queue = redKpisNeedingResponse(_dept);
  const rollup = rollupSignal(_dept.id);
  // If the modal's KPI is no longer resolvable at all (no KPI definition and
  // no persisted response), drop it rather than render a broken modal.
  if (_modalKpiId && !modalItemFor(_modalKpiId)) { _modalKpiId = null; _modalEditing = false; }

  const answeredCount   = _queue.filter((it) =>
    !!(getResponse({ deptId: _dept.id, kpiId: it.kpiId }) || {}).answered).length;
  const unansweredCount = _queue.length - answeredCount;

  _mount.innerHTML = `
    ${renderPageHead(_dept, unansweredCount, answeredCount, rollup)}
    <div class="chat" style="grid-template-columns: minmax(260px, 34fr) 66fr">
      <div>${renderLeftColumn(_dept, _queue)}</div>
      <div id="askmark-chat-host">${renderChatCard(activeThread())}</div>
    </div>
    <div id="askmark-modal-root">${_modalKpiId ? renderResponseModal() : ''}</div>`;

  attachHandlers();
  document.removeEventListener('keydown', onModalKeydown);
  if (_modalKpiId) {
    bindModal();
    document.addEventListener('keydown', onModalKeydown);
  }
  scrollThreadToBottom();
}

// Reads `respond=<kpiId>` off the current hash (app.js's routing docstring
// reserves this param for exactly this — opening the Ask Mark response
// modal for a KPI via a deep link, e.g. from Overview or an inbox item).
function parseRespondParam() {
  const hashQuery = location.hash.includes('?') ? location.hash.split('?')[1] : '';
  return new URLSearchParams(hashQuery).get('respond');
}

// ─── Public entry point ───────────────────────────────────────────────────────

/**
 * renderAskMark(dept, mount, session)
 * @param {object} dept    — department data object (from data/<id>.json)
 * @param {Element} mount  — DOM element to render into (#view-mount)
 * @param {object} session — { deptId, role, persona }
 */
function renderAskMark(dept, mount, session) {
  _dept = dept;
  _mount = mount;
  _session = session;
  _sending = false;
  _submitting = false;
  _drafts = {};              // reset unsubmitted drafts per render (also guards against
                              // any stale cross-dept draft surviving a dept switch)
  _threads = [newThread()];  // fresh session-scoped chat state — never persisted (mirrors
  _activeThreadId = _threads[0].id; // the old single-`_thread`'s reset-per-mount behavior)
  _modalKpiId = null;
  _modalEditing = false;

  const respondKpiId = parseRespondParam();
  if (respondKpiId) {
    const queue = redKpisNeedingResponse(dept);
    const inQueue = queue.some((q) => q.kpiId === respondKpiId);
    const hasResp = !!getResponse({ deptId: dept.id, kpiId: respondKpiId });
    if (inQueue || hasResp) _modalKpiId = respondKpiId;
  }

  doRender();
}

;return { renderAskMark };
})();

/* ==== views/hoshin.js ==== */
__M["views/hoshin.js"] = (function(){
/**
 * views/hoshin.js — WE 2026 Hoshin (annual policy-deployment) view
 *
 * Exports:
 *   renderHoshin(dept, mount)              — mounts the per-function Hoshin page (router entry)
 *   hoshinPageHTML(dept, hoshin)           — pure HTML-string builder for the full page (Node-testable)
 *   hoshinStrip(hoshin, dept)              — KPI-Boards alignment strip, consumed by the board views
 *   hoshinChips(hoshin, dept)              — small H<n> pill chips for a board row/header
 *
 * Ported from docs/redesign/reference/view-hoshin.js (§5.3 DESIGN-GUIDE), wired to
 * OUR data layer (lib/hoshin.js: objectives/activitiesFor/functionalLeadFor/
 * objectiveRelations/loadHoshin + data/hoshin.json) instead of the reference's
 * single global DATA object.
 *
 * Signature notes for callers (Task 8/8b KPI-Boards):
 *   - lib/hoshin.js's pure functions take (hoshin, deptId) — bare id strings,
 *     because that module has zero knowledge of display names. hoshinStrip/
 *     hoshinChips live here in the VIEW layer instead and need the department's
 *     human name (dept.name — not present anywhere in data/hoshin.json) for the
 *     strip's sentence + disk tooltips, so they take the whole `dept` object
 *     (the same object every view already has in scope) rather than a bare id.
 *   - Both are pure string builders — no DOM, no fetch. A board view must fetch
 *     data/hoshin.json itself (via lib/hoshin.js's loadHoshin(), same
 *     fire-and-forget splice pattern views/overview.js already uses for
 *     data/kz-records.json) and pass the resolved object in as `hoshin`.
 *   - wireHoshinStrip(mount) is an optional convenience export: delegated
 *     click/keydown handling for the strip's [data-go-hoshin] card, routing to
 *     `#/dept/<data-hoshin-dept>/hoshin`. Board views may use it or wire their
 *     own listener — the strip's markup carries a `data-hoshin-dept` attribute
 *     either way.
 *
 * Zero-invented-data guards (data/hoshin.json's own fields, nothing added):
 *   - Objective "1-year priority" text prefers the objective's real
 *     `description` (verbatim deck-quote text captured on the Marketing
 *     block's activities — see data/hoshin.json _meta.objectiveMapping),
 *     falling back to the shorter `priorityTag`, falling back to a neutral
 *     "not captured" note. 4 of the 5 WE 2026 objectives carry a real
 *     `description`; only Acquisitions has no verbatim description anywhere
 *     in source, so its card falls through to its short `priorityTag`
 *     bracket-tag text — never a fabricated priority sentence.
 *   - Target/Support-function/Accountable text is split on the source's own
 *     "\n" line breaks and rendered verbatim. Where a line count lines up 1:1
 *     across target/support/lead (the common case), each target row gets its
 *     own matching support+lead; where the counts don't line up (some source
 *     rows list 3 collaborating functions against 2 targets), we do NOT invent
 *     a mapping — every real value is shown on every row instead of guessing
 *     which line goes with which.
 *   - Due date: the source's Gantt-fill "confidence" flag (see
 *     data/hoshin.json _meta.timelineMethod) marks 29 of 31 activities
 *     'unverified-default-full-range' — a template artifact, not a real
 *     commitment. Only the 2 activities flagged 'derived-from-fill-gap' show a
 *     real end date; everything else renders a neutral "—" (with the reason in
 *     its title) rather than a fabricated due date.
 *   - Status: data/hoshin.json carries no per-activity status field at all —
 *     unlike the reference (which hardcodes "On Plan" for its own sample DATA),
 *     every row here shows a neutral "Not tracked" badge.
 *   - "Measured on this board by …" footer: the reference's per-activity
 *     `kpis` link to board KPI ids does not exist anywhere in our
 *     data/hoshin.json — omitted rather than guessed.
 *   - No per-KPI Hoshin mapping exists in our data (the reference's kpiMap is
 *     a field on its own global DATA object we don't have) — hoshinChips() is
 *     department-scoped (every objective the dept's activities DRIVE), not
 *     KPI-scoped.
 */

const { objectives, activitiesFor, functionalLeadFor, objectiveRelations, loadHoshin } = __M["lib/hoshin.js"];

// ─── Small shared helpers ───────────────────────────────────────────────────

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function splitLines(s) {
  return String(s == null ? '' : s).split('\n').map((x) => x.trim()).filter(Boolean);
}

// Per-row value picker: zips 1:1 only when the line count matches the number
// of target rows (the common, reliable case); otherwise broadcasts the whole
// real list so nothing is silently dropped or invented.
function perRow(list, i, rowCount) {
  if (list.length === rowCount && rowCount > 0) return [list[i]].filter(Boolean);
  return list;
}

function joinWithAnd(strs) {
  if (!strs.length) return '';
  if (strs.length === 1) return strs[0];
  if (strs.length === 2) return strs.join(' and ');
  return strs.slice(0, -1).join(', ') + ' and ' + strs[strs.length - 1];
}

function hoshinDisk(n, relation, size) {
  const s = size || 30;
  const cls = relation === 'drives' ? 'hoshin-disk--drives' : relation === 'supports' ? 'hoshin-disk--supports' : '';
  return `<span class="hoshin-disk ${cls}" style="width:${s}px;height:${s}px;font-size:${Math.round(s * 0.42)}px">${n}</span>`;
}

// 1-based position of an objective in the canonical WE 2026 list — the same
// order objectives()/objectiveRelations() always iterate in.
function objectiveNumber(hoshin, objectiveId) {
  const idx = objectives(hoshin).findIndex((o) => o.id === objectiveId);
  return idx === -1 ? null : idx + 1;
}

function mappedObjectiveIds(activity) {
  const ids = [];
  if (activity.objectiveId) ids.push(activity.objectiveId);
  if (Array.isArray(activity.objectiveIds)) {
    activity.objectiveIds.forEach((id) => { if (id && !ids.includes(id)) ids.push(id); });
  }
  return ids;
}

// ─── Due / status cells (the zero-invented-data guards) ────────────────────

function dueCell(activity) {
  const tl = activity.timeline;
  if (tl && tl.confidence === 'derived-from-fill-gap' && tl.end) {
    return `<span class="tnum" style="white-space:nowrap">${esc(tl.end)}</span>`;
  }
  return `<span class="muted" title="Timeline range in source is unverified — not a confirmed commitment date (see data/hoshin.json _meta.timelineMethod)">—</span>`;
}

function statusCell() {
  // No per-activity status field exists in data/hoshin.json — never fabricate one.
  return `<span class="badge badge--neutral">Not tracked</span>`;
}

// ─── Quarter chips — built from the activity's own real timeline.months ────

const QUARTER_MONTHS = {
  Q1: ["Jan'26", "Feb'26", "Mar'26"],
  Q2: ["Apr'26", "May'26", "Jun'26"],
  Q3: ["Jul'26", "Aug'26", "Sep'26"],
  Q4: ["Oct'26", "Nov'26", "Dec'26"],
};

function quarterChipsHTML(activity) {
  const months = (activity.timeline && activity.timeline.months) || [];
  return Object.entries(QUARTER_MONTHS).map(([q, ms]) => {
    const on = ms.some((m) => months.includes(m));
    return `<span class="q-chip ${on ? 'is-on' : ''}">${q}</span>`;
  }).join('');
}

// ─── Section 1 — objective cards ────────────────────────────────────────────

function objectiveCardsHTML(hoshin, dept) {
  const rels = objectiveRelations(hoshin, dept.id);
  const allObjs = objectives(hoshin); // same order objectiveRelations() iterates
  return rels.map((r, i) => {
    const obj = allObjs[i];
    const n = i + 1;
    const drives = r.relation === 'drives';
    const badgeLabel = `${esc(dept.name)} ${drives ? 'drives' : 'supports'}`;
    const priorityText = obj && obj.description
      ? esc(obj.description)
      : obj && obj.priorityTag
        ? esc(obj.priorityTag)
        : 'No literal priority tag captured in source for this objective.';
    return `
    <section class="card card--pad hoshin-obj ${drives ? 'hoshin-obj--ops' : ''}">
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px">
        ${hoshinDisk(n, r.relation, 32)}
        <h4 style="flex:1">${esc(r.name)}</h4>
        <span class="badge ${drives ? 'badge--info' : 'badge--neutral'}">${badgeLabel}</span>
      </div>
      <p style="margin:0; font-size:12.5px; line-height:1.55; color:var(--text-dim)">${priorityText}</p>
    </section>`;
  }).join('');
}

// ─── Section 2 — one card per activity plan ────────────────────────────────

function activityBlockHTML(hoshin, dept, activity) {
  const mapIds = mappedObjectiveIds(activity);
  const disksHTML = mapIds.length
    ? mapIds.map((id) => {
        const n = objectiveNumber(hoshin, id);
        return n ? hoshinDisk(n, 'drives', 24) : '';
      }).join('')
    : `<span class="chip">No objective mapped</span>`;

  const priorityLine = activity.hoshinPriority
    ? `<span class="faint" style="font-size:12px">Hoshin priority: ${esc(activity.hoshinPriority)}</span>`
    : `<span class="faint" style="font-size:12px">No Hoshin priority text captured in source</span>`;

  const leadLines = splitLines(activity.lead);
  const leadHeaderHTML = leadLines.length
    ? `<b>${esc(leadLines.join(' / '))}</b>`
    : `<span class="muted" style="font-size:12.5px">Not yet assigned</span>`;

  const targets = splitLines(activity.target);
  const supports = splitLines(activity.supportFunction);
  const rows = targets.length ? targets : ['No target/milestone text captured in source'];
  const dueHTML = dueCell(activity);
  const statusHTML = statusCell();

  const rowsHTML = rows.map((t, i) => {
    const rowSupports = perRow(supports, i, targets.length);
    const supportHTML = rowSupports.length
      ? rowSupports.map((s) => `<span class="chip">${esc(s)}</span>`).join(' ')
      : '<span class="muted">—</span>';
    const rowLeads = perRow(leadLines, i, targets.length);
    const leadCellHTML = rowLeads.length ? esc(rowLeads.join(', ')) : '—';
    return `<tr>
      <td>${esc(t)}</td>
      <td>${supportHTML}</td>
      <td class="muted">${leadCellHTML}</td>
      <td class="muted tnum" style="white-space:nowrap">${dueHTML}</td>
      <td>${statusHTML}</td>
    </tr>`;
  }).join('');

  return `
  <section class="card" style="margin-bottom:16px">
    <div class="hoshin-act__head">
      <div style="display:flex; gap:6px">${disksHTML}</div>
      <div style="flex:1; min-width:0">
        <h3>${esc(activity.activityPlan) || 'Untitled activity plan'}</h3>
        ${priorityLine}
      </div>
      <div class="hoshin-act__lead">
        <span class="running-head">Lead</span>
        ${leadHeaderHTML}
      </div>
      <div class="hoshin-act__timeline">${quarterChipsHTML(activity)}</div>
    </div>
    <div class="table-scroll">
      <table class="dt">
        <thead><tr>
          <th style="min-width:340px">Target · Milestone</th><th>Support function</th><th>Accountable</th><th>Due</th><th>Status</th>
        </tr></thead>
        <tbody>${rowsHTML}</tbody>
      </table>
    </div>
  </section>`;
}

// ─── Public: full-page HTML (pure — Node-testable with a fixture) ─────────

function hoshinPageHTML(dept, hoshin) {
  const lead = functionalLeadFor(hoshin, dept.id) || 'Not yet assigned';
  const acts = activitiesFor(hoshin, dept.id);
  const objectiveCards = objectiveCardsHTML(hoshin, dept);
  const activityBlocks = acts.length
    ? acts.map((a) => activityBlockHTML(hoshin, dept, a)).join('')
    : `<p class="muted">No Hoshin activity plans captured for ${esc(dept.name)} in the source workbook.</p>`;

  return `
  <div class="page-head">
    <div>
      <span class="running-head page-head__eyebrow">WE 2026 Hoshin · Functional Lead: ${esc(lead)}</span>
      <h1>${esc(dept.name)} Hoshin</h1>
      <p class="page-head__sub">Company objectives, the ${esc(dept.name)} activity plans that move them, and the accountable lead behind every target.</p>
    </div>
    <div class="page-head__side">
      <button class="btn btn--secondary" data-go="kpi">KPI Boards</button>
    </div>
  </div>

  <div class="section-head" style="margin-top:0"><span class="running-head">1-year Hoshin priorities (2026) — company-wide</span></div>
  <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(230px,1fr))">${objectiveCards}</div>

  <div class="section-head"><span class="running-head">${esc(dept.name)} activity plans — every target tracked to an owner</span></div>
  ${activityBlocks}

  <section class="card card--pad" style="border-left:3px solid hsl(var(--we-sky))">
    <span class="running-head">Support functions</span>
    <p style="margin:8px 0 0; font-size:13.5px; line-height:1.6; color:var(--text-secondary); max-width:100ch">Targets owned by another function roll up on that function's own Hoshin page — this page tracks ${esc(dept.name)}'s own activity plans and the functions supporting them.</p>
  </section>`;
}

// ─── Public: KPI-Boards alignment strip (pure) ─────────────────────────────
//
// hoshinStrip(hoshin, dept) — takes the whole dept object (not a bare id) so
// it can name the department in its sentence + disk tooltips without knowing
// anything data/hoshin.json itself doesn't carry (display names live only in
// data/<dept>.json / data/departments.json).
function hoshinStrip(hoshin, dept) {
  const rels = objectiveRelations(hoshin, dept.id);
  const name = dept.name || dept.id;

  const disksHTML = rels.map((r, i) => {
    const n = i + 1;
    const title = `${r.name} — ${r.relation === 'drives' ? `${name} drives this` : `${name} supports this`}`;
    return `<span class="hoshin-strip__item" title="${esc(title)}">${hoshinDisk(n, r.relation, 26)}</span>`;
  }).join('');

  const drivesNames = rels
    .map((r, i) => (r.relation === 'drives' ? `Hoshin ${i + 1} · ${r.name}` : null))
    .filter(Boolean);
  const supportsCount = rels.length - drivesNames.length;

  const boldLine = drivesNames.length
    ? `This board drives ${joinWithAnd(drivesNames)}`
    : `${name} doesn't yet drive a WE 2026 objective directly`;
  const dimLine = supportsCount > 0
    ? `${name} also supports ${supportsCount} other WE 2026 objective${supportsCount === 1 ? '' : 's'}.`
    : '';

  return `
  <section class="card hoshin-strip" role="button" tabindex="0" data-go-hoshin data-hoshin-dept="${esc(dept.id)}" aria-label="Open the ${esc(name)} Hoshin view">
    <div class="hoshin-strip__disks">${disksHTML}</div>
    <div class="hoshin-strip__text">
      <b>${esc(boldLine)}</b>
      ${dimLine ? `<span class="muted">${esc(dimLine)}</span>` : ''}
    </div>
    <span class="btn btn--outline btn--sm" style="pointer-events:none">Open Hoshin View →</span>
  </section>`;
}

// Optional convenience: delegated click/keydown wiring for hoshinStrip()'s
// card. Board views may call this after splicing the strip's markup in, or
// wire their own listener against the same [data-go-hoshin]/[data-hoshin-dept]
// attributes.
function wireHoshinStrip(mount) {
  const go = (el) => { location.hash = `#/dept/${el.dataset.hoshinDept}/hoshin`; };
  mount.addEventListener('click', (e) => {
    const card = e.target.closest('[data-go-hoshin]');
    if (card) go(card);
  });
  mount.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('[data-go-hoshin]');
    if (card) { e.preventDefault(); go(card); }
  });
}

// ─── Public: small H<n> chips for a board row (pure) ───────────────────────
//
// hoshinChips(hoshin, dept) — department-scoped (see file header: no per-KPI
// mapping exists in data/hoshin.json). Renders one chip per objective this
// dept's activities DRIVE; '' when the dept drives none (e.g. an empty
// activities block).
function hoshinChips(hoshin, dept) {
  const rels = objectiveRelations(hoshin, dept.id);
  const driven = rels
    .map((r, i) => (r.relation === 'drives' ? { n: i + 1, name: r.name } : null))
    .filter(Boolean);
  if (!driven.length) return '';
  return driven
    .map(({ n, name }) => `<span class="hoshin-chip" title="Rolls into Hoshin ${n} — ${esc(name)}">H${n}</span>`)
    .join('');
}

// ─── Public: router entry point — fetches data/hoshin.json + mounts ───────

function loadingHTML(dept) {
  return `
  <div class="page-head">
    <div>
      <span class="running-head page-head__eyebrow">WE 2026 Hoshin</span>
      <h1>${esc(dept.name)} Hoshin</h1>
      <p class="page-head__sub">Loading Hoshin data…</p>
    </div>
  </div>`;
}

function unavailableHTML(dept) {
  return `
  <div class="page-head">
    <div>
      <span class="running-head page-head__eyebrow">WE 2026 Hoshin</span>
      <h1>${esc(dept.name)} Hoshin</h1>
      <p class="page-head__sub">Hoshin data is unavailable right now.</p>
    </div>
  </div>`;
}

function renderHoshin(dept, mount) {
  mount.innerHTML = loadingHTML(dept);
  loadHoshin().then((hoshin) => {
    if (!hoshin) { mount.innerHTML = unavailableHTML(dept); return; }
    mount.innerHTML = hoshinPageHTML(dept, hoshin);
    mount.addEventListener('click', (e) => {
      const goBtn = e.target.closest('[data-go]');
      if (goBtn) location.hash = `#/dept/${dept.id}/${goBtn.dataset.go}`;
    });
  });
}

;return { hoshinPageHTML, hoshinStrip, wireHoshinStrip, hoshinChips, renderHoshin };
})();

/* ==== views/kpi.js ==== */
__M["views/kpi.js"] = (function(){
/**
 * views/kpi.js — KPI Boards (main → sub-KPI connection drill)
 *
 * renderKpi(dept, mount)
 *
 * The non-Operations counterpart to the Operations location board
 * (views/teamboard-location.js): every department's main KPIs click in to
 * their real sub-KPI contributors (dept.kpis[].contributors). Service goes
 * one level deeper — main → team → rep → the rep's 7 real L1 day-by-day
 * sub-KPIs — because that is the real shape of dept.kpis for Service only
 * (see the "Sales also has repSubs" note below).
 *
 * Markup rebuilt to the §5.2 KPI-Boards idiom (docs/redesign/DESIGN-GUIDE.md)
 * — the same `.dt` table / `.status-cell` / `.chip` / `sparkline` / caret /
 * `.kpi-sub` components views/teamboard-location.js already ports (Task 8),
 * applied here to the main→sub connection drill instead of the main→location
 * drill. Data lookups (lib/registry.js, lib/rag.js, lib/explain.js,
 * lib/comments.js, lib/hoshin.js) and the drill/expand behavior are
 * unchanged from before this rebuild — only the markup, plus two real
 * data-shape bugs fixed in the process (documented below), moved.
 *
 * No `.seg` / adaptive chart card: unlike Operations, none of these 8
 * departments' kpi.js switches on a location or chart-KPI dimension today
 * (verified against every data/<dept>.json — zero location models, zero
 * `weeklyActuals`-style multi-series objects anywhere outside
 * data/operations.json), so per the task brief neither is added here —
 * inventing a seg/chart-card would mean inventing a dimension these boards
 * don't have. Every KPI's own trend is single-series, so the Trend column is
 * always a plain `sparkline()` with no legend (§4's single-series rule).
 *
 * What changed vs. the pre-rebuild file (markup + two real bugs, not new
 * data):
 *   - The boxed "What this KPI means" explain panel and the "▸ KPI details"
 *     identity-toggle sub-panel are gone — once teamboard-location.js's own
 *     idiom is applied, they're exactly the "banner box that restates what a
 *     chip can say" DESIGN-GUIDE anti-pattern (target/actual/status/source
 *     are already the row; cascade position/RAG-rule text/cadence were
 *     static boilerplate, not KPI-specific). The one genuinely load-bearing
 *     bit — explainKpi(...)'s grounded "why" sentence — now surfaces as the
 *     row's own `.kpi-flag-note` on expand, the same fallback
 *     teamboard-location.js's weMainNoteLines/locNoteLines already use.
 *   - Comment threads (lib/comments.js) for red/amber main KPIs are kept —
 *     real, recently-shipped functionality with no equivalent in
 *     teamboard-location.js to copy a convention from, so it's re-skinned in
 *     place as its own full-width `.kpi-sub` row rather than dropped.
 *   - BUG FIX — marketing.json series shape: 12 of its KPIs
 *     (branded_search_volume, social_engagement_rate, social_media_growth,
 *     pr_unique_viewers and 8 of their contributors) store `series` as
 *     `[{week,date,target,actual}]` point objects, not the flat `number[]`
 *     every other dept's `series` is. The pre-rebuild renderer fed that
 *     straight into formatVal/ragStatus/svgLine, which silently rendered
 *     "[object Object]" as the actual value and forced every one of those
 *     KPIs red (an object coerces to NaN; ragStatus's ratio check falls
 *     through NaN >= x to the red branch) with a blank "no data" chart.
 *     seriesData() below normalizes both shapes to real {values,labels} —
 *     using real week numbers for labels (so gapped weeks like 1,5,10… don't
 *     get mislabeled by array index) — a bug fix, not new data: every value
 *     shown already existed in the point object's own `.actual`/`.week`.
 *   - The data-quality roll-up banner (e.g. Service's Team Noel) now renders
 *     the flagged KPI's own real `flagDetail` text verbatim via
 *     `.frozen-banner` (the amber alert box already used elsewhere for this
 *     exact purpose) instead of a hand-duplicated paraphrase of the same
 *     numbers — avoids the two ever drifting apart.
 *   - sourceChip() drops the old red/green "manual"/"re-keyed" badge tints —
 *     RAG hues are status-only per the redesign's global constraint; the
 *     manual/re-keyed nuance still surfaces via the chip's title tooltip and,
 *     for HR's 6 `manualOnly` KPIs, via their own real
 *     `targetSource: "Manual — reported"` text.
 *
 * Zero-invented-data / preserved-quirk notes:
 *   - Frozen depts (Finance: dept.frozen === true): the pre-rebuild kpi.js
 *     applied NO gating at all — no banner, no disabled drill. That gating
 *     only ever existed in the dead views/teamboard.js (imported in app.js
 *     but never called — see the file's own dispatch table). Per "keep
 *     whatever gating the current kpi.js applies," none is added here
 *     either; Finance renders as a normal connection-drill board. Flagged in
 *     the task report as a real gap for a follow-up task — not fixed here,
 *     out of this task's markup-only scope.
 *   - marketing.json's wei_leads_revenue lists a contributor id
 *     `mkt_sourced_revenue_wei` that does not exist anywhere in
 *     data/marketing.json (the real, unrelated KPI is `mkt_sourced_revenue`
 *     — likely a source-data typo). contributorsOf() already returns `[]`
 *     for it, same as before the rebuild; not "fixed" here since that would
 *     mean editing data/marketing.json, out of this task's views/kpi.js-only
 *     scope.
 *   - Sales' rep_* KPIs also carry a real `repSubs` object (identical shape
 *     to Service's), but only `dept.id === 'service'` gets the 3-level
 *     team→rep→L1 drill below, matching the pre-rebuild file's exact gating
 *     — Sales' repSubs stays unused here, unchanged from before.
 *   - Sales' rev_total lists rev_outside/rev_inside as its own
 *     "contributors" even though both are themselves real mains with their
 *     own rep contributors — since Sales is not `service`, expanding
 *     rev_total renders them as flat generic leaf sub-rows (no further
 *     drill), same as before; both remain independently drillable via their
 *     own top-level main rows. Service has the analogous case (rev_total →
 *     rev_we/rev_hpi as "teams" → rev_jc/rev_noel mis-cast as "reps" with no
 *     repSubs, showing the graceful "No L1 sub-KPI data" fallback) — also
 *     unchanged from the pre-rebuild file, which had the identical
 *     recursive-contributors behavior.
 *   - The `illustrative` chip only renders where dept.kpis actually carries
 *     `illustrative: true` (Logistics' 4 per-location shipping-margin subs,
 *     IT's Sprint Burndown/Azure DevOps Points) — omitted everywhere else,
 *     never invented.
 */

const { mains, contributorsOf } = __M["lib/registry.js"];
const { ragStatus } = __M["lib/rag.js"];
const { sparkline, wireChartHover } = __M["lib/charts.js"];
const { explainKpi } = __M["lib/explain.js"];
const { commentThreadHTML, bindComments } = __M["lib/comments.js"];
const { hoshinStrip, hoshinChips, wireHoshinStrip } = __M["views/hoshin.js"];
const { loadHoshin } = __M["lib/hoshin.js"];

// ─── Small shared helpers ───────────────────────────────────────────────────

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Right-chevron; `.kpi-name__caret.is-open` rotates it 90° to point down —
// same SVG + behavior as views/teamboard-location.js's CARET_SVG.
const CARET_SVG = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 3l5 5-5 5"/></svg>';
const CARET_PLACEHOLDER = '<span style="display:inline-block;width:22px;flex-shrink:0"></span>';

// ─── Value formatting ────────────────────────────────────────────────────────

function formatVal(v, unit) {
  if (v == null) return '—';
  if (typeof v !== 'number') return String(v);
  if (unit && (unit.startsWith('$') || unit.includes('$'))) {
    if (Math.abs(v) >= 1_000_000) return '$' + (v / 1_000_000).toFixed(2) + 'M';
    if (Math.abs(v) >= 1_000)     return '$' + (v / 1_000).toFixed(0) + 'k';
    return '$' + v.toLocaleString();
  }
  if (unit === 'ratio' || unit === 'percent' || unit === '%' || unit === 'pct') return (v * 100).toFixed(1) + '%';
  if (Math.abs(v) >= 1_000_000) return (v / 1_000_000).toFixed(2) + 'M';
  if (Math.abs(v) >= 1_000)     return (v / 1_000).toFixed(0) + 'k';
  return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

/**
 * seriesData(kpi) → { values: (number|null)[], labels: string[] }
 * Normalizes `kpi.series`, which is a flat number[] for every dept EXCEPT
 * marketing.json (12 KPIs there store `[{week,date,target,actual}]` point
 * objects instead — see file header). Real week numbers are used for labels
 * when present so gapped weeks (e.g. 1, 5, 10…) aren't mislabeled by index.
 */
function seriesData(kpi) {
  const raw = Array.isArray(kpi.series) ? kpi.series : [];
  if (raw.length && raw[0] && typeof raw[0] === 'object') {
    return {
      values: raw.map((pt) => (pt && typeof pt.actual === 'number') ? pt.actual : null),
      labels: raw.map((pt, i) => 'Wk ' + (pt && pt.week != null ? pt.week : i + 1)),
    };
  }
  return { values: raw, labels: raw.map((_, i) => 'Wk ' + (i + 1)) };
}

/** Last series value, falling back to kpi.actual when there's no series at all. */
function lastValue(kpi) {
  const { values } = seriesData(kpi);
  return values.length ? values[values.length - 1] : (kpi.actual != null ? kpi.actual : null);
}

function sparkFor(kpi) {
  const { values, labels } = seriesData(kpi);
  if (!values.length) return '';
  return sparkline(values, { w: 132, h: 34, target: kpi.target, name: kpi.name + ' trend', labels, fmt: kpi.unit });
}

// ─── Status cell / chips ─────────────────────────────────────────────────────

function statusCell(rag) {
  const label = { green: 'On Track', amber: 'At Risk', red: 'Off Track', nodata: 'No Data' }[rag] || 'No Data';
  return `<span class="status-cell status-cell--${rag}"><span class="dot"></span>${label}</span>`;
}

/** Target-source `.chip` — plain mono chip; manual/re-keyed nuance lives in
 *  the title tooltip, never in a borrowed RAG hue (status colors are
 *  status-only per the redesign's global constraint). */
function sourceChip(kpi) {
  const ts = kpi.targetSource || kpi.source;
  if (!ts) return '';
  const label = ts.split(' / ')[0];
  const wasReKeyed = kpi.source && kpi.source !== ts &&
    ['manual', 'hand-keyed', 'coo board', 'literal', 'bowler'].some((tok) => String(kpi.source).toLowerCase().includes(tok));
  const title = wasReKeyed ? `Target: ${ts} (today: re-keyed from ${kpi.source})` : ts;
  return `<span class="chip" title="${esc(title)}">${esc(label)}</span>`;
}

function illustrativeChip(kpi) {
  return kpi.illustrative
    ? `<span class="chip" title="Illustrative — placeholder trend, not a live tracked number">illustrative</span>`
    : '';
}

// ─── Per-KPI "why" note on expand ────────────────────────────────────────────

function noteLines(kpi, dept, rag) {
  // The roll-up data-quality banner (rollupBannerHTML) already carries
  // flagDetail's narrative below the table — don't restate it here too.
  if (kpi.flagDetail) return [];
  const lines = [];
  if (kpi.note) lines.push(kpi.note);
  if (kpi.flag && typeof kpi.flag === 'string') lines.push(kpi.flag);
  if (kpi.nodataNote) lines.push(kpi.nodataNote);
  if (!lines.length) {
    const why = explainKpi(kpi, dept, { rag }).why;
    if (why) lines.push(why);
  }
  return lines;
}

function flagNoteHTML(kpi, dept, rag) {
  return noteLines(kpi, dept, rag).map((n) => `<div class="kpi-flag-note">${esc(n)}</div>`).join('');
}

// ─── Comment thread row — red/amber main KPIs only ───────────────────────────

function commentRowHTML(dept, kpi, rag) {
  const author = `${dept.lead || 'Lead'} (L2)`;
  return `
    <tr class="kpi-sub">
      <td colspan="6" style="padding:10px 16px 16px">
        ${commentThreadHTML({ deptId: dept.id, kpi, rag, author, collapsed: false })}
      </td>
    </tr>`;
}

// ─── Roll-up data-quality banner (below the table) ───────────────────────────

function rollupBannerHTML(kpi) {
  if (!kpi || !kpi.flagDetail) return '';
  return `
    <div class="frozen-banner" role="status" style="align-items:flex-start; margin-top:16px">
      <div>
        <strong>Data quality — ${esc(kpi.name)} roll-up is incomplete</strong>
        <div style="margin-top:4px; line-height:1.55">${esc(kpi.flagDetail)}</div>
      </div>
    </div>`;
}

// ─── Generic sub-row (level 2) — every dept except Service's team/rep path ──

function genericSubRowHTML(dept, sub) {
  const act = lastValue(sub);
  const rag = ragStatus(act, sub.target, sub.direction || 'higher_better');
  return `
    <tr class="kpi-sub">
      <td>
        <div class="kpi-name">
          ${CARET_PLACEHOLDER}
          ${esc(sub.name)}
          ${illustrativeChip(sub)}
        </div>
        ${flagNoteHTML(sub, dept, rag)}
      </td>
      <td class="num">${formatVal(sub.target, sub.unit)}</td>
      <td class="num">${formatVal(act, sub.unit)}</td>
      <td>${statusCell(rag)}</td>
      <td>${sourceChip(sub)}</td>
      <td>${sparkFor(sub)}</td>
    </tr>`;
}

// ─── Service only: rep's 7 real L1 day-by-day sub-KPIs (deepest level) ──────

const SUB_KPI_LABELS = {
  incomingRevenue:  'Incoming Revenue WE+HP',
  quotes:           'Quotes',
  openQuotes:       'Open Quotes',
  deals:            'Deals / Win%',
  openDeals:        'Open Deals',
  grip:             'Grip / Retention',
  timeWithCustomer: 'Time with Customer',
};

const SUB_KPI_UNITS = {
  incomingRevenue:  '$/wk',
  quotes:           'count',
  openQuotes:       'count',
  deals:            'count',
  openDeals:        'count',
  grip:             '%',
  timeWithCustomer: 'count',
};

function repSubRowHTML(key, sub) {
  const unit = SUB_KPI_UNITS[key];
  const series = sub.series || [];
  const lastVal = series.length ? series[series.length - 1] : null;
  const rag = ragStatus(lastVal, sub.target, 'higher_better');
  const isGrip = key === 'grip';
  const chip = isGrip
    ? `<span class="chip" style="border-color:hsl(var(--action-4));background:hsl(var(--action-1));color:var(--accent-text)" title="Live feed from the Grip system">Grip (live)</span>`
    : `<span class="chip" title="Hand-keyed literal">manual</span>`;
  const spark = series.filter((v) => v != null).length >= 2
    ? sparkline(series, { w: 132, h: 34, target: sub.target, name: SUB_KPI_LABELS[key] + ' trend', labels: series.map((_, i) => 'Wk ' + (i + 1)), fmt: unit })
    : '';
  return `
    <tr class="kpi-sub">
      <td style="padding-left:88px">
        ${esc(SUB_KPI_LABELS[key])}
        ${sub.note ? `<div class="kpi-flag-note" style="margin-left:0">${esc(sub.note)}</div>` : ''}
      </td>
      <td class="num">${formatVal(sub.target, unit)}</td>
      <td class="num">${formatVal(lastVal, unit)}</td>
      <td>${statusCell(rag)}</td>
      <td>${chip}</td>
      <td>${spark}</td>
    </tr>`;
}

function repSubsRowsHTML(rep) {
  if (!rep.repSubs) {
    return `<tr class="kpi-sub"><td colspan="6" style="padding-left:88px;color:var(--text-faint);font-size:12.5px">No L1 sub-KPI data for this rep.</td></tr>`;
  }
  const firstName = String(rep.name || '').split('—')[0].trim();
  const bandRow = `<tr class="kpi-cat"><td colspan="6"><span>Day-by-day — ${esc(firstName)}</span></td></tr>`;
  const rows = Object.keys(SUB_KPI_LABELS)
    .filter((key) => rep.repSubs[key])
    .map((key) => repSubRowHTML(key, rep.repSubs[key]))
    .join('');
  return bandRow + rows;
}

// ─── Service only: rep row (level 3) — always expandable into its L1 subs ───
//
// Expand state is tracked in its OWN Set (state.expandedRepIds), separate
// from the main/team Sets below. Service's data lets the same KPI id appear
// at more than one cascade depth at once (see the rev_total → rev_we/rev_hpi
// "team" quirk documented in the file header) — sharing a single Set across
// levels would let expanding a real team bleed into an unrelated rep-shaped
// render of the same id reached through that quirk. Three level-scoped Sets
// (matching the pre-rebuild file's expandedIds/expandedTeamIds/
// expandedRepIds) keep each cascade position's open/closed state independent.

function serviceRepRowHTML(dept, rep, expandedRepIds) {
  const act = lastValue(rep);
  const rag = ragStatus(act, rep.target, rep.direction || 'higher_better');
  const isExpanded = expandedRepIds.has(rep.id);
  const caret = `<button class="kpi-name__caret ${isExpanded ? 'is-open' : ''}" data-rep-row="${esc(rep.id)}" aria-expanded="${isExpanded}" aria-label="Expand ${esc(rep.name)}">${CARET_SVG}</button>`;
  let rows = `
    <tr class="kpi-sub">
      <td style="padding-left:68px">
        <div class="kpi-name">${caret}${esc(rep.name)}</div>
        ${isExpanded ? flagNoteHTML(rep, dept, rag) : ''}
      </td>
      <td class="num">${formatVal(rep.target, rep.unit)}</td>
      <td class="num">${formatVal(act, rep.unit)}</td>
      <td>${statusCell(rag)}</td>
      <td>${sourceChip(rep)}</td>
      <td>${sparkFor(rep)}</td>
    </tr>`;
  if (isExpanded) rows += repSubsRowsHTML(rep);
  return rows;
}

// ─── Service only: team row (level 2) — expandable only when it has reps ────

function serviceTeamRowHTML(dept, team, expandedTeamIds, expandedRepIds) {
  const act = lastValue(team);
  const rag = ragStatus(act, team.target, team.direction || 'higher_better');
  const reps = contributorsOf(dept, team.id);
  const hasReps = reps.length > 0;
  const isExpanded = expandedTeamIds.has(team.id);
  const caret = hasReps
    ? `<button class="kpi-name__caret ${isExpanded ? 'is-open' : ''}" data-team-row="${esc(team.id)}" aria-expanded="${isExpanded}" aria-label="Expand ${esc(team.name)}">${CARET_SVG}</button>`
    : CARET_PLACEHOLDER;
  let rows = `
    <tr class="kpi-sub">
      <td>
        <div class="kpi-name">${caret}<strong>${esc(team.name)}</strong></div>
        ${isExpanded ? flagNoteHTML(team, dept, rag) : ''}
      </td>
      <td class="num">${formatVal(team.target, team.unit)}</td>
      <td class="num">${formatVal(act, team.unit)}</td>
      <td>${statusCell(rag)}</td>
      <td>${sourceChip(team)}</td>
      <td>${sparkFor(team)}</td>
    </tr>`;
  if (isExpanded && hasReps) {
    rows += reps.map((rep) => serviceRepRowHTML(dept, rep, expandedRepIds)).join('');
  }
  return rows;
}

// ─── Main row (level 1) ──────────────────────────────────────────────────────

function mainRowHTML(dept, kpi, hoshin, state) {
  const isExpanded = state.expandedIds.has(kpi.id);
  const act = lastValue(kpi);
  const rag = ragStatus(act, kpi.target, kpi.direction || 'higher_better');
  const hchips = hoshin ? hoshinChips(hoshin, dept) : '';
  const caret = `<button class="kpi-name__caret ${isExpanded ? 'is-open' : ''}" data-row="${esc(kpi.id)}" aria-expanded="${isExpanded}" aria-label="Expand ${esc(kpi.name)}">${CARET_SVG}</button>`;

  let rows = `
    <tr class="kpi-row">
      <td>
        <div class="kpi-name">
          ${caret}
          ${esc(kpi.name)}
          ${illustrativeChip(kpi)}
          ${hchips}
        </div>
        ${isExpanded ? flagNoteHTML(kpi, dept, rag) : ''}
      </td>
      <td class="num">${formatVal(kpi.target, kpi.unit)}</td>
      <td class="num" style="font-weight:600">${formatVal(act, kpi.unit)}</td>
      <td>${statusCell(rag)}</td>
      <td>${sourceChip(kpi)}</td>
      <td>${sparkFor(kpi)}</td>
    </tr>`;

  if (isExpanded) {
    const children = contributorsOf(dept, kpi.id);
    if (children.length) {
      rows += dept.id === 'service'
        ? children.map((team) => serviceTeamRowHTML(dept, team, state.expandedTeamIds, state.expandedRepIds)).join('')
        : children.map((sub) => genericSubRowHTML(dept, sub)).join('');
    } else {
      rows += `<tr class="kpi-sub"><td colspan="6" style="text-align:center;padding:16px;color:var(--text-faint);font-size:12.5px">No sub-KPIs connect to this main — it is entered directly.</td></tr>`;
    }
    if (rag === 'red' || rag === 'amber') rows += commentRowHTML(dept, kpi, rag);
  }
  return rows;
}

// ─── Table body ──────────────────────────────────────────────────────────────

function tableBodyHTML(dept, hoshin, state) {
  const allMains = mains(dept);
  const filtered = state.filterText
    ? allMains.filter((k) => k.name.toLowerCase().includes(state.filterText.toLowerCase()))
    : allMains;
  if (!filtered.length) {
    return `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-faint)">No KPIs match "${esc(state.filterText)}"</td></tr>`;
  }
  return filtered.map((k) => mainRowHTML(dept, k, hoshin, state)).join('');
}

function flaggedBannerHTML(dept, state) {
  const flaggedMain = mains(dept).find((k) => k.flagDetail && state.expandedIds.has(k.id));
  return rollupBannerHTML(flaggedMain);
}

// ─── Public entry point ───────────────────────────────────────────────────────

function renderKpi(dept, mount) {
  const state = {
    filterText: '',
    expandedIds: new Set(),     // main-level (level 1)
    expandedTeamIds: new Set(), // Service team-level (level 2)
    expandedRepIds: new Set(),  // Service rep-level (level 3)
  };
  let hoshin = null;
  const hasIllustrative = (dept.kpis || []).some((k) => k.illustrative);

  function fullHTML() {
    return `
    <div class="page-head">
      <div>
        <span class="running-head page-head__eyebrow">${esc(dept.name)} · Connection Drill</span>
        <h1>KPI Boards</h1>
        <p class="page-head__sub">Click any KPI's caret to see its sub-KPI connections and what's driving its status.</p>
      </div>
      <div class="page-head__side">
        <button class="btn btn--secondary" data-go="team">Back to Overview</button>
      </div>
    </div>

    ${hoshin ? hoshinStrip(hoshin, dept) : ''}

    <div class="flex" style="align-items:center; justify-content:flex-end; gap:16px; margin:24px 0">
      <input class="input" id="kpi-filter" style="max-width:220px" type="search" placeholder="Filter KPIs" aria-label="Filter KPIs" value="${esc(state.filterText)}">
    </div>

    <div class="table-wrap"><div class="table-scroll">
      <table class="dt">
        <thead><tr>
          <th style="min-width:300px">KPI</th><th class="num">Target</th><th class="num">Actual</th>
          <th>Status</th><th>Target source</th><th>Trend</th>
        </tr></thead>
        <tbody>${tableBodyHTML(dept, hoshin, state)}</tbody>
      </table>
    </div></div>

    ${flaggedBannerHTML(dept, state)}

    <p class="board-hint">Click a KPI's caret to expand its sub-KPI connections${dept.id === 'service' ? ' — main → team → rep → day-by-day for Incoming Revenue' : ''}.${hasIllustrative ? ' <span class="chip">illustrative</span> marks a placeholder trend, not a live tracked number.' : ''} Off-track and at-risk KPIs carry a note thread with Mark's read and space for your own.</p>
    <div class="chart-tip" id="chart-tip"></div>`;
  }

  function paint() {
    const prevFilter = mount.querySelector('#kpi-filter');
    const hadFocus = !!prevFilter && document.activeElement === prevFilter;
    const selStart = hadFocus ? prevFilter.selectionStart : null;

    mount.innerHTML = fullHTML();

    if (hadFocus) {
      const inp = mount.querySelector('#kpi-filter');
      if (inp) {
        inp.focus();
        try { inp.setSelectionRange(selStart, selStart); } catch { /* no-op */ }
      }
    }
    const tip = mount.querySelector('#chart-tip');
    if (tip) wireChartHover(mount, tip);
    bindComments(mount);
  }

  mount.addEventListener('click', (e) => {
    const backBtn = e.target.closest('[data-go]');
    if (backBtn) { location.hash = `#/dept/${dept.id}/${backBtn.dataset.go}`; return; }

    const rowBtn = e.target.closest('[data-row]');
    if (rowBtn) {
      const id = rowBtn.dataset.row;
      if (state.expandedIds.has(id)) state.expandedIds.delete(id); else state.expandedIds.add(id);
      paint();
      return;
    }

    const teamBtn = e.target.closest('[data-team-row]');
    if (teamBtn) {
      const id = teamBtn.dataset.teamRow;
      if (state.expandedTeamIds.has(id)) state.expandedTeamIds.delete(id); else state.expandedTeamIds.add(id);
      paint();
      return;
    }

    const repBtn = e.target.closest('[data-rep-row]');
    if (repBtn) {
      const id = repBtn.dataset.repRow;
      if (state.expandedRepIds.has(id)) state.expandedRepIds.delete(id); else state.expandedRepIds.add(id);
      paint();
    }
  });

  mount.addEventListener('input', (e) => {
    if (e.target && e.target.id === 'kpi-filter') {
      state.filterText = e.target.value;
      paint();
    }
  });

  wireHoshinStrip(mount);

  paint();

  loadHoshin().then((h) => {
    if (!h) return;
    hoshin = h;
    paint();
  });
}

;return { renderKpi };
})();

/* ==== views/login.js ==== */
__M["views/login.js"] = (function(){
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
function resolvePersona(dept, role) {
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

function renderLogin(mount, onEnter, departments) {
  const depts = departments || [];
  let deptId = null;
  let role = null;   // 'L2' | 'L1'

  mount.innerHTML = `
    <div class="login">
      <div class="login__brandside">
        <div class="login__brand">
          <div class="brand__mark">FM</div>
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

;return { resolvePersona, renderLogin };
})();

/* ==== views/myboard.js ==== */
__M["views/myboard.js"] = (function(){
/**
 * views/myboard.js — My Board (browse any L1 rep's KPI vs target)
 *
 * renderMyBoard(dept, mount)
 *
 * Re-skinned onto the same component idiom as views/myday.js / overview.js
 * per §5.9 of docs/redesign/DESIGN-GUIDE.md ("apply the same card/table/
 * badge idiom to myboard.js"): `.page-head`, a `.seg` rep switcher (same
 * pattern views/teamboard-location.js's location switcher uses), a
 * `.hero-kpi` card for the selected rep's headline vs target + 8-week
 * sparkline, an amber "Data flag" card for any real flag/nodata note, and a
 * `.driver-grid` of `.stat-tile`s for the rep's real activity drivers.
 *
 * Data + behavior preserved from the pre-rebuild file: rep-selector state
 * (repIds from dept.reps, first rep selected by default), the same
 * byId()/ragStatus() lookups, and a graceful nodata-rep card (e.g. Sales'
 * Eric — target/actuals entirely absent).
 *
 * Activity-driver labels/units use the SAME canonical map views/myday.js and
 * views/kpi.js's Service 3-level drill use for the current repSubs schema
 * (incomingRevenue/quotes/openQuotes/deals/openDeals/grip/timeWithCustomer)
 * — the old defs list here (calls/weiMeetings/hpMeetings/newOppsWEI/
 * hpNewQuotes/revHPI/…) matched none of Service's real repSubs keys post
 * e4b9081 ("enrich L1 structure") and silently rendered zero driver rows for
 * every Service rep; this rebuild fixes that the same way myday.js does.
 */

const { byId } = __M["lib/registry.js"];
const { ragStatus } = __M["lib/rag.js"];
const { sparkline } = __M["lib/charts.js"];

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Formatters — same conventions as views/overview.js / views/myday.js ──

function formatVal(v, unit) {
  if (v == null) return '—';
  if (typeof v !== 'number') return String(v);
  if (unit && (unit.startsWith('$') || unit.includes('$'))) {
    if (Math.abs(v) >= 1_000_000) return '$' + (v / 1_000_000).toFixed(2) + 'M';
    if (Math.abs(v) >= 1_000)     return '$' + (v / 1_000).toFixed(0) + 'k';
    return '$' + v.toLocaleString();
  }
  if (unit === 'ratio' || unit === 'percent' || unit === '%' || unit === 'pct') return (v * 100).toFixed(1) + '%';
  if (Math.abs(v) >= 1_000_000) return (v / 1_000_000).toFixed(2) + 'M';
  if (Math.abs(v) >= 1_000)     return (v / 1_000).toFixed(0) + 'k';
  return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function statusBadge(rag) {
  const map = {
    green:  ['green',   'On Track'],
    amber:  ['amber',   'At Risk'],
    red:    ['red',     'Off Track'],
    nodata: ['outline', 'No Data'],
  };
  const [cls, label] = map[rag] || map.nodata;
  const dot = rag === 'nodata' ? '' : '<span class="dot"></span>';
  return `<span class="badge badge--${cls}">${dot}${label}</span>`;
}

function displayActual(kpi) {
  if (kpi.series && kpi.series.length) {
    const last = [...kpi.series].reverse().find((v) => v != null);
    return last != null ? last : null;
  }
  return kpi.actual;
}

function unitCadence(unit) {
  if (!unit || typeof unit !== 'string') return '';
  const i = unit.indexOf('/');
  return i >= 0 ? ' / ' + unit.slice(i + 1) : '';
}

// ─── Activity-driver canonical label/unit map — identical to views/myday.js
// (kept in sync deliberately; see that file's header for the schema note). ─

const DRIVER_LABELS = {
  quotes:           'Quotes',
  openQuotes:       'Open Quotes',
  deals:            'Deals / Win%',
  openDeals:        'Open Deals',
  grip:             'Grip / Retention',
  timeWithCustomer: 'Time with Customer',
  calls:            'Calls',
  coldCalls:        'Cold Calls',
  meetings:         'Meetings',
  newOpps:          'New Opps',
};

const DRIVER_UNITS = {
  quotes:           'count',
  openQuotes:       'count',
  deals:            'count',
  openDeals:        'count',
  grip:             '%',
  timeWithCustomer: 'count',
  calls:            'calls/wk',
  coldCalls:        'calls/wk',
  meetings:         'mtgs/wk',
  newOpps:          'opps/wk',
};

// `incomingRevenue` excluded deliberately — for every Service rep it is the
// same series/target as the rep's own headline KPI (see views/myday.js).
const DRIVER_ORDER = Object.keys(DRIVER_LABELS);

function buildDriverTile(key, sub) {
  const label  = DRIVER_LABELS[key] || key;
  const unit   = DRIVER_UNITS[key] || '';
  const series = sub.series || [];
  const latest = [...series].reverse().find((v) => v != null) ?? null;
  const hasTarget = sub.target != null;
  const rag = hasTarget ? ragStatus(latest, sub.target, 'higher_better') : 'nodata';
  const hasSpark = series.filter((v) => v != null).length >= 2;
  const spark = hasSpark
    ? sparkline(series, { w: 200, h: 32, target: sub.target, name: label + ' trend', labels: series.map((_, i) => 'Day ' + (i + 1)), fmt: unit })
    : '';

  return `
    <section class="card stat-tile" style="padding:16px">
      <div class="stat-tile__top">
        <span class="stat-tile__label">${esc(label)}</span>
        ${hasTarget ? statusBadge(rag) : '<span class="badge badge--outline">No Data</span>'}
      </div>
      <div class="stat-tile__value">${formatVal(latest, unit)}</div>
      <div class="stat-tile__vs">Target ${hasTarget ? formatVal(sub.target, unit) : '—'}</div>
      ${spark ? `<div class="stat-tile__spark">${spark}</div>` : ''}
      ${sub.note ? `<div class="faint" style="font-size:11px; margin-top:2px">${esc(sub.note)}</div>` : ''}
    </section>`;
}

function buildDriversHTML(kpi) {
  const subs = kpi.repSubs;
  if (!subs) return '';
  return DRIVER_ORDER
    .filter((key) => subs[key])
    .map((key) => buildDriverTile(key, subs[key]))
    .join('');
}

// ─── Rep card (hero + drivers) ──────────────────────────────────────────────

function renderRepCard(kpi) {
  if (!kpi) return '<p class="muted">Rep not found.</p>';

  if (kpi.nodata) {
    return `
      <section class="card hero-kpi" aria-label="${esc(kpi.name)} — no data">
        <div class="hero-kpi__main">
          <div class="hero-kpi__label">
            <h3>${esc(kpi.name)}</h3>
            ${statusBadge('nodata')}
          </div>
          <div class="hero-kpi__value">—</div>
          ${kpi.nodataNote ? `<div class="hero-kpi__vs">${esc(kpi.nodataNote)}</div>` : ''}
        </div>
      </section>`;
  }

  const act = displayActual(kpi);
  const rag = ragStatus(act, kpi.target, kpi.direction || 'higher_better');
  const targetDisplay = kpi.target != null ? formatVal(kpi.target, kpi.unit) + unitCadence(kpi.unit) : '—';
  const series = kpi.series || [];
  const hasSpark = series.filter((v) => v != null).length >= 2;
  const spark = hasSpark
    ? sparkline(series, {
        w: 560, h: 120, target: kpi.target,
        name: `${kpi.name} weekly`, labels: series.map((_, i) => 'Wk ' + (i + 1)), fmt: kpi.unit,
      }).replace('<svg class="spark"', '<svg class="spark" style="width:100%;height:auto"')
    : '';
  const sourceNote = [kpi.source, kpi.targetSource ? 'target from ' + kpi.targetSource : null].filter(Boolean).join(' · ');

  const flagCard = kpi.flag ? `
    <section class="card card--pad" style="margin-top:16px; border-left:3px solid var(--amber); display:flex; gap:8px; align-items:baseline">
      <b style="font-size:13px; color:var(--amber-text); white-space:nowrap">Data flag</b>
      <span style="font-size:13.5px; color:var(--text-secondary)">${esc(kpi.flag)}</span>
    </section>` : '';

  return `
    <section class="card hero-kpi" aria-label="${esc(kpi.name)} headline KPI">
      <div class="hero-kpi__main">
        <div class="hero-kpi__label">
          <h3>${esc(kpi.name)}</h3>
          ${statusBadge(rag)}
        </div>
        <div class="hero-kpi__value">${formatVal(act, kpi.unit)}</div>
        <div class="hero-kpi__vs">vs target <b>${targetDisplay}</b></div>
        <div class="hero-kpi__foot">
          ${sourceNote ? `<span class="source-note">${esc(sourceNote)}</span>` : '<span></span>'}
        </div>
      </div>
      <div class="hero-kpi__side" style="display:flex; flex-direction:column; gap:12px">
        <span class="running-head">8-week trend</span>
        ${spark || '<span class="faint" style="font-size:12.5px">Not enough weekly data yet for a trend.</span>'}
      </div>
    </section>
    ${flagCard}
    <div class="section-head"><span class="running-head">Activity drivers</span></div>
    <div class="driver-grid">
      ${buildDriversHTML(kpi) || '<p class="muted">No activity-driver metrics for this rep.</p>'}
    </div>
    ${kpi.note ? `<p class="board-hint">${esc(kpi.note)}</p>` : ''}`;
}

// ─── Public entry point ─────────────────────────────────────────────────────

function renderMyBoard(dept, mount) {
  const repIds = dept.reps || dept.kpis.filter((k) => k.level === 3).map((k) => k.id);

  if (!repIds.length) {
    mount.innerHTML = `
      <div class="page-head">
        <div>
          <span class="running-head page-head__eyebrow">${esc(dept.name)} · L1</span>
          <h1>My Board</h1>
        </div>
      </div>
      <section class="card card--pad">
        <p class="muted">No individual rep data available for this department.</p>
      </section>`;
    return;
  }

  let selectedRep = repIds[0];

  function segHTML() {
    return repIds.map((id) => {
      const kpi = byId(dept, id);
      const label = kpi ? kpi.name.split(' — ')[0].trim() : id;
      return `<button class="seg__item ${id === selectedRep ? 'is-on' : ''}" data-rep-id="${esc(id)}">${esc(label)}</button>`;
    }).join('');
  }

  function paint() {
    mount.innerHTML = `
      <div class="page-head">
        <div>
          <span class="running-head page-head__eyebrow">${esc(dept.name)} · L1 Reps</span>
          <h1>My Board</h1>
          <p class="page-head__sub">Individual rep performance vs target</p>
        </div>
        <div class="page-head__side">
          <a href="#/dept/${esc(dept.id)}/team" class="btn btn--secondary">Back to Team Board</a>
        </div>
      </div>

      <div class="flex" style="align-items:center; gap:16px; flex-wrap:wrap; margin:0 0 24px">
        <span class="running-head">Rep</span>
        <div class="seg" role="tablist" aria-label="Rep">${segHTML()}</div>
      </div>

      <div id="rep-card-area">${renderRepCard(byId(dept, selectedRep))}</div>`;

    mount.querySelectorAll('[data-rep-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedRep = btn.dataset.repId;
        paint();
      });
    });
  }

  paint();
}

;return { renderMyBoard };
})();

/* ==== views/myday.js ==== */
__M["views/myday.js"] = (function(){
/**
 * views/myday.js — L1 "My Day" (§5.9 of docs/redesign/DESIGN-GUIDE.md)
 *
 * renderMyDay(dept, mount, persona)
 *
 * Markup rebuilt to match docs/redesign/reference/view-rest.js's My Day
 * renderer: a serif greeting, a 2-col `.hero-kpi` headline card (mirrors
 * views/overview.js's hero — same classes, same conventions), an amber
 * "Data flag" card when the rep's headline KPI carries a real flag/nodata
 * note, a `.driver-grid` of `.stat-tile`s for the rep's real activity
 * drivers, and a "This week's context" reason composer + logged-reasons
 * card wired to the same lib/reasons.js store as before.
 *
 * Data plumbing preserved from the pre-rebuild file:
 *   - resolveRepKpi(dept, persona): matches the signed-in persona's name
 *     against the dept's rep KPIs (per-user L1 differentiation) — unchanged.
 *   - lib/reasons.js: addReason/getReasons/getReasonsByEntity/seedDemoReasons
 *     — same store, same call shape (deptId/kpiId/entityId/author/text/status).
 *
 * Real changes vs. the pre-rebuild layout (structural, not data):
 *   - "This week's context" (composer + logged-reasons) is now unconditional,
 *     matching the reference — the old file only showed the reason composer
 *     for red/amber headlines and a plain "target met" line for green ones.
 *     The redesign's My Day always offers reason-logging + a history panel
 *     regardless of the headline's status, which is also a strictly more
 *     useful surface (a rep can log context on a green week too).
 *   - Activity-driver labels/units now use the SAME canonical map
 *     views/kpi.js's Service 3-level drill already established
 *     (SUB_KPI_LABELS/SUB_KPI_UNITS there) for the exact repSubs schema
 *     data/service.json carries today (incomingRevenue/quotes/openQuotes/
 *     deals/openDeals/grip/timeWithCustomer) — the OLD label list here
 *     (calls/weiMeetings/hpMeetings/newOppsWEI/hpNewQuotes/revHPI/…) was
 *     written for a key-naming scheme data/service.json no longer uses as of
 *     e4b9081 ("enrich L1 structure"), so for every Service rep it silently
 *     matched zero keys and rendered "No activity-driver metrics for this
 *     rep." — a real bug this rebuild fixes by aligning with the current
 *     schema. Sales' reps (calls/coldCalls/meetings/newOpps) keep their
 *     existing keys/labels, which the old map did cover correctly.
 *   - `incomingRevenue` is deliberately excluded from the driver grid: for
 *     every Service rep it is byte-for-byte the same series/target as the
 *     rep's own headline KPI (it's the same underlying number restated under
 *     a repSub key, not a distinct driver) — showing it twice would just
 *     duplicate the hero card directly above it.
 *   - "rolls up to <team> → <parent KPI>" is derived from the real
 *     `parentId` chain (rep → team → main, or rep → main directly for depts
 *     with no team layer, e.g. Sales) via lib/registry.js's byId() — never
 *     hardcoded, so it's correct for every rep in every dept that has one.
 */

const { byId } = __M["lib/registry.js"];
const { ragStatus } = __M["lib/rag.js"];
const { sparkline } = __M["lib/charts.js"];
const { addReason, getReasonsByEntity, seedDemoReasons } = __M["lib/reasons.js"];

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Formatters — mirrors views/overview.js's conventions so My Day's hero
// reads identically to Overview's (same value/badge/source-note treatment). ─

function formatVal(v, unit) {
  if (v == null) return '—';
  if (typeof v !== 'number') return String(v);
  if (unit && (unit.startsWith('$') || unit.includes('$'))) {
    if (Math.abs(v) >= 1_000_000) return '$' + (v / 1_000_000).toFixed(2) + 'M';
    if (Math.abs(v) >= 1_000)     return '$' + (v / 1_000).toFixed(0) + 'k';
    return '$' + v.toLocaleString();
  }
  if (unit === 'ratio' || unit === 'percent' || unit === '%' || unit === 'pct') return (v * 100).toFixed(1) + '%';
  if (Math.abs(v) >= 1_000_000) return (v / 1_000_000).toFixed(2) + 'M';
  if (Math.abs(v) >= 1_000)     return (v / 1_000).toFixed(0) + 'k';
  return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function isPctUnit(unit) {
  return unit === 'ratio' || unit === 'percent' || unit === '%' || unit === 'pct';
}

// Same split as Overview's heroValueParts: only percent-like units split the
// hero numeral from its unit; everything else renders formatVal()'s full
// string whole (never an invented "$116 / ,430" split for other units).
function heroValueParts(kpi) {
  const act = displayActual(kpi);
  if (act == null) return { main: '—', small: '' };
  if (isPctUnit(kpi.unit)) return { main: (act * 100).toFixed(1), small: '%' };
  return { main: formatVal(act, kpi.unit), small: '' };
}

function statusBadge(rag) {
  const map = {
    green:  ['green',   'On Track'],
    amber:  ['amber',   'At Risk'],
    red:    ['red',     'Off Track'],
    nodata: ['outline', 'No Data'],
  };
  const [cls, label] = map[rag] || map.nodata;
  const dot = rag === 'nodata' ? '' : '<span class="dot"></span>';
  return `<span class="badge badge--${cls}">${dot}${label}</span>`;
}

function displayActual(kpi) {
  if (kpi && kpi.series && kpi.series.length) {
    const last = [...kpi.series].reverse().find((v) => v != null);
    return last != null ? last : null;
  }
  return kpi ? kpi.actual : null;
}

// Unit's cadence suffix, e.g. "$/wk" → " / wk" — used only in the hero's
// "vs target" line, matching the reference's "$26,960 / wk" treatment.
function unitCadence(unit) {
  if (!unit || typeof unit !== 'string') return '';
  const i = unit.indexOf('/');
  return i >= 0 ? ' / ' + unit.slice(i + 1) : '';
}

function sourceNoteFor(kpi) {
  const parts = [];
  if (kpi.source) parts.push(kpi.source.split(' / ')[0]);
  if (kpi.targetSource) parts.push('target from ' + kpi.targetSource);
  return parts.join(' · ');
}

// "rolls up to <team> → <parent main KPI>" — real parentId chain only.
// Service reps roll up rep → team (rev_jc) → main (rev_we); Sales reps roll
// up rep → main directly (no team layer) — both real shapes, never invented.
function rollupLine(dept, kpi) {
  const parent = kpi.parentId ? byId(dept, kpi.parentId) : null;
  if (!parent) return '';
  if (parent.isMain) return ` · rolls up to ${esc(parent.name)}`;
  const grandparent = parent.parentId ? byId(dept, parent.parentId) : null;
  return grandparent
    ? ` · rolls up to ${esc(parent.name)} → ${esc(grandparent.name)}`
    : ` · rolls up to ${esc(parent.name)}`;
}

function seriesFootnote(series, unit) {
  if (!series || !series.length) return '';
  return series.map((v, i) => `Wk${i + 1} ${formatVal(v, unit)}`).join(' · ');
}

function resolveRepKpi(dept, persona) {
  const repIds = dept.reps || dept.kpis.filter((k) => k.level === 3).map((k) => k.id);
  if (!repIds.length) return null;
  const wanted = (persona && persona.name || '').toLowerCase();
  if (wanted) {
    const match = repIds
      .map((id) => byId(dept, id))
      .find((k) => k && k.name.toLowerCase().includes(wanted));
    if (match) return match;
  }
  return byId(dept, repIds[0]);
}

// ─── Activity-driver canonical label/unit map ──────────────────────────────
// Service schema mirrors views/kpi.js's SUB_KPI_LABELS/SUB_KPI_UNITS exactly
// (same repSubs shape) — kept in sync deliberately so the same metric reads
// with the same name on My Day and on the KPI Boards drill. Sales' legacy
// keys (calls/coldCalls/meetings/newOpps) are the only other repSubs shape
// in the app today (see data/sales.json).
const DRIVER_LABELS = {
  quotes:           'Quotes',
  openQuotes:       'Open Quotes',
  deals:            'Deals / Win%',
  openDeals:        'Open Deals',
  grip:             'Grip / Retention',
  timeWithCustomer: 'Time with Customer',
  calls:            'Calls',
  coldCalls:        'Cold Calls',
  meetings:         'Meetings',
  newOpps:          'New Opps',
};

const DRIVER_UNITS = {
  quotes:           'count',
  openQuotes:       'count',
  deals:            'count',
  openDeals:        'count',
  grip:             '%',
  timeWithCustomer: 'count',
  calls:            'calls/wk',
  coldCalls:        'calls/wk',
  meetings:         'mtgs/wk',
  newOpps:          'opps/wk',
};

// `incomingRevenue` is deliberately NOT in this map — see file header note.
const DRIVER_ORDER = Object.keys(DRIVER_LABELS);

function buildDriverTile(key, sub) {
  const label  = DRIVER_LABELS[key] || key;
  const unit   = DRIVER_UNITS[key] || '';
  const series = sub.series || [];
  const latest = [...series].reverse().find((v) => v != null) ?? null;
  const hasTarget = sub.target != null;
  const rag = hasTarget ? ragStatus(latest, sub.target, 'higher_better') : 'nodata';
  const hasSpark = series.filter((v) => v != null).length >= 2;
  const spark = hasSpark
    ? sparkline(series, { w: 200, h: 32, target: sub.target, name: label + ' trend', labels: series.map((_, i) => 'Day ' + (i + 1)), fmt: unit })
    : '';

  return `
    <section class="card stat-tile" style="padding:16px">
      <div class="stat-tile__top">
        <span class="stat-tile__label">${esc(label)}</span>
        ${hasTarget ? statusBadge(rag) : '<span class="badge badge--outline">No Data</span>'}
      </div>
      <div class="stat-tile__value">${formatVal(latest, unit)}</div>
      <div class="stat-tile__vs">Target ${hasTarget ? formatVal(sub.target, unit) : '—'}</div>
      ${spark ? `<div class="stat-tile__spark">${spark}</div>` : ''}
      ${sub.note ? `<div class="faint" style="font-size:11px; margin-top:2px">${esc(sub.note)}</div>` : ''}
    </section>`;
}

function buildDriversHTML(kpi) {
  const subs = kpi.repSubs;
  if (!subs) return '';
  return DRIVER_ORDER
    .filter((key) => subs[key])
    .map((key) => buildDriverTile(key, subs[key]))
    .join('');
}

// ─── Logged-reasons list + composer ─────────────────────────────────────────

function relTime(isoTs) {
  const diff = Date.now() - new Date(isoTs).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 2)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function reasonEntryHTML(r) {
  const tone = r.status === 'red' ? 'red' : r.status === 'amber' ? 'amber' : r.status === 'green' ? 'green' : 'nodata';
  return `
    <div style="display:flex; gap:10px">
      <span class="status-cell status-cell--${tone}" style="margin-top:2px"><span class="dot"></span></span>
      <div>
        <div style="font-size:13px; line-height:1.55; color:var(--text-secondary)">${esc(r.text)}</div>
        <div class="faint" style="font-size:11.5px; margin-top:2px">${esc(r.author)} · ${relTime(r.ts)}</div>
      </div>
    </div>`;
}

// ─── Hero card — same idiom as views/overview.js's `.hero-kpi` ─────────────

function buildHeroCard(dept, kpi) {
  const rag = kpi.nodata ? 'nodata' : ragStatus(displayActual(kpi), kpi.target, kpi.direction || 'higher_better');
  const { main, small } = heroValueParts(kpi);
  const targetDisplay = kpi.target != null ? formatVal(kpi.target, kpi.unit) + unitCadence(kpi.unit) : '—';
  const sourceNote = sourceNoteFor(kpi);
  const series = kpi.series || [];
  const hasSpark = series.filter((v) => v != null).length >= 2;
  const spark = hasSpark
    ? sparkline(series, {
        w: 560, h: 120, target: kpi.target,
        name: `${kpi.name} weekly`, labels: series.map((_, i) => 'Wk ' + (i + 1)), fmt: kpi.unit,
      }).replace('<svg class="spark"', '<svg class="spark" style="width:100%;height:auto"')
    : '';
  const footnote = seriesFootnote(series, kpi.unit);

  return `
    <section class="card hero-kpi" aria-label="My headline target">
      <div class="hero-kpi__main">
        <div class="hero-kpi__label">
          <div><span class="running-head">My headline</span><h3 style="margin-top:4px">${esc(kpi.name)}</h3></div>
          ${statusBadge(rag)}
        </div>
        <div class="hero-kpi__value">${main}${small ? `<small>${small}</small>` : ''}</div>
        <div class="hero-kpi__vs">vs target <b>${targetDisplay}</b>${rollupLine(dept, kpi)}</div>
        <div class="hero-kpi__foot">
          ${sourceNote ? `<span class="source-note">${esc(sourceNote)}</span>` : '<span></span>'}
        </div>
      </div>
      <div class="hero-kpi__side" style="display:flex; flex-direction:column; gap:12px">
        <span class="running-head">8-week trend</span>
        ${spark || '<span class="faint" style="font-size:12.5px">Not enough weekly data yet for a trend.</span>'}
        ${footnote ? `<span class="faint" style="font-size:12px">${esc(footnote)}</span>` : ''}
      </div>
    </section>`;
}

// ─── Public entry point ─────────────────────────────────────────────────────

function renderMyDay(dept, mount, persona) {
  // Seed illustrative demo reasons on first load (idempotent).
  try { seedDemoReasons(); } catch { /* __ls unavailable */ }

  const kpi = resolveRepKpi(dept, persona);
  const name = (persona && persona.name) || 'there';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  if (!kpi) {
    mount.innerHTML = `
      <div class="page-head">
        <div>
          <span class="running-head page-head__eyebrow">${esc(dept.name)} · L1</span>
          <h1>Good day, ${esc(name)}.</h1>
          <p class="page-head__sub">${today}</p>
        </div>
      </div>
      <section class="card card--pad">
        <p class="muted">No individual rep data is available for ${esc(dept.name)} yet. My Day will populate once your KPIs are wired to a source.</p>
      </section>`;
    return;
  }

  // Team eyebrow segment: only when the rep's parent is a team (not a main
  // KPI directly) — real per lib/registry.js's parentId chain.
  const parent = kpi.parentId ? byId(dept, kpi.parentId) : null;
  const teamLabel = parent && !parent.isMain ? parent.name : null;

  // Data-flag banner: prefer the KPI's own real `flag`; fall back to
  // `nodataNote` for reps whose tab is entirely empty (e.g. Sales' Eric) —
  // both are real fields already on the KPI, never invented.
  const flagText = kpi.flag || kpi.nodataNote || null;

  const entityReasons = getReasonsByEntity({ deptId: dept.id, entityId: kpi.id });

  mount.innerHTML = `
    <div class="page-head">
      <div>
        <span class="running-head page-head__eyebrow">${esc(dept.name)} · L1${teamLabel ? ' · ' + esc(teamLabel) : ''}</span>
        <h1>Good day, ${esc(name)}.</h1>
        <p class="page-head__sub">${today} · ${esc(dept.name)} · your targets for the week</p>
      </div>
    </div>

    ${buildHeroCard(dept, kpi)}

    ${flagText ? `
    <section class="card card--pad" style="margin-top:16px; border-left:3px solid var(--amber); display:flex; gap:8px; align-items:baseline">
      <b style="font-size:13px; color:var(--amber-text); white-space:nowrap">Data flag</b>
      <span style="font-size:13.5px; color:var(--text-secondary)">${esc(flagText)}</span>
    </section>` : ''}

    <div class="section-head"><span class="running-head">My activity drivers</span></div>
    <div class="driver-grid">
      ${buildDriversHTML(kpi) || '<p class="muted">No activity-driver metrics for this rep.</p>'}
    </div>

    <div class="section-head"><span class="running-head">This week's context</span></div>
    <div class="grid" style="grid-template-columns: 3fr 2fr">
      <section class="card card--pad">
        <h4 style="margin-bottom:12px">Log a reason for this week's numbers</h4>
        <div class="field-list">
          <textarea class="input" id="reason-input" rows="3" placeholder="e.g. 3 quotes short — 2 accounts rescheduled to Thu"></textarea>
          <div style="display:flex; justify-content:flex-end"><button class="btn btn--primary" id="reason-save">Save Reason</button></div>
        </div>
      </section>
      <section class="card card--pad" id="week-context">
        <span class="running-head">Logged reasons</span>
        <div id="reason-list" style="margin-top:12px; display:grid; gap:12px">
          ${entityReasons.length ? entityReasons.map(reasonEntryHTML).join('') : '<p class="faint" style="font-size:12.5px">No reasons logged this week yet.</p>'}
        </div>
      </section>
    </div>`;

  const saveBtn = mount.querySelector('#reason-save');
  saveBtn.addEventListener('click', () => {
    const textarea = mount.querySelector('#reason-input');
    const text = textarea.value.trim();
    if (!text) return;
    const rag = kpi.nodata ? 'nodata' : ragStatus(displayActual(kpi), kpi.target, kpi.direction || 'higher_better');
    addReason({ deptId: dept.id, kpiId: kpi.id, entityId: kpi.id, author: name, text, status: rag });
    renderMyDay(dept, mount, persona);
  });
}

;return { renderMyDay };
})();

/* ==== views/odg-hub.js ==== */
__M["views/odg-hub.js"] = (function(){
/**
 * views/odg-hub.js — ODG Method Hub (dedicated board)
 *
 * renderOdgHub(dept, mount)
 *
 * ODG is the method hub, not a plain KPI table. This dedicated board shows:
 *  1. Headline adoption gap — FMDS vs 8-Step — as `.stat-tile` cards
 *  2. SRR-by-department as a comparison bar chart
 *  3. Training-plan-vs-actual by the 8 programs as a comparison bar chart
 *  4. Link to KZ tracker (#/dept/odg/solve)
 *
 * Data is read from dept (data/odg.json) — no invented numbers.
 *
 * Re-skinned per §5.9 of docs/redesign/DESIGN-GUIDE.md ("apply the same
 * card/table/badge idiom to odg-hub.js") onto the shared `.page-head`,
 * `.card`/`.card--pad`, `.running-head`, `.section-head`, `.badge`, and
 * `.stat-tile` classes — the old custom `.odg-section`/`.odg-stat-*` CSS
 * (injected via a runtime <style> tag) is gone; every rule now comes from
 * the ported design-system classes in styles.css.
 *
 * SRR-by-department and training-by-program stay as comparison bar charts
 * (not a `.dt` status table): both are readings of many entities against
 * ONE shared reference point, not a per-row on/off-track gate, and — for
 * training specifically — the "target" (0.1 = a 10%/month RAMP RATE) is not
 * even the same kind of number as the "actual" (a CUMULATIVE adoption
 * percentage), so a naive ragStatus(actual, target) ratio would read every
 * program as wildly "green" regardless of how it's really doing. SRR's
 * contributors do carry a real, comparable target (1.0 = 100% per
 * department), but its own `note` field flags real doubt about whether the
 * five departments reading exactly 0% are truly non-adopters or simply
 * not-yet-scored — grading that as a hard "Off Track" would overstate
 * confidence the source data itself doesn't have. Both charts therefore
 * render via the shared `svgBars()` export from lib/charts.js with NO
 * per-row `rag` (a single identity color, not a status hue) rather than the
 * RAG-only `meter()`/`.status-cell` idiom used for the app's real per-row
 * status pages — same conclusion the pre-rebuild file reached, now drawn
 * from the shared chart library instead of a private `vizBars()` clone.
 */

const { svgBars } = __M["lib/charts.js"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function pct(ratio) {
  if (ratio == null) return '—';
  return (ratio * 100).toFixed(1) + '%';
}

// ─── Adoption headline — `.stat-tile` cards, no badge (these two numbers are
// descriptive headline stats, not target-graded KPIs in the source data). ──

function renderAdoptionHeadline(dept) {
  const h = dept.headline || {};
  const fmds      = h.fmdsAdoption      ?? null;
  const eightStep = h.eightStepAdoption ?? null;
  const gap       = (fmds != null && eightStep != null) ? fmds - eightStep : null;

  return `
    <div class="section-head" style="margin-top:0"><span class="running-head">Adoption gap — the product thesis</span></div>
    <p class="muted" style="max-width:70ch; margin-bottom:16px; line-height:1.55">
      FMDS awareness is near-universal; 8-Step problem-solving is barely started.
      Closing this gap is what the OS exists to do.
    </p>
    <div class="stat-grid" style="margin-bottom:32px">
      <section class="card stat-tile">
        <div class="stat-tile__top"><span class="stat-tile__label">FMDS Adoption</span></div>
        <div class="stat-tile__value">${pct(fmds)}</div>
        <div class="stat-tile__vs">Trained on the FMDS framework</div>
      </section>
      <section class="card stat-tile">
        <div class="stat-tile__top"><span class="stat-tile__label">8-Step Usage</span></div>
        <div class="stat-tile__value">${pct(eightStep)}</div>
        <div class="stat-tile__vs">Actively using 8-Step problem-solving</div>
      </section>
      ${gap != null ? `
      <section class="card stat-tile">
        <div class="stat-tile__top"><span class="stat-tile__label">Adoption Gap</span></div>
        <div class="stat-tile__value">${pct(gap)}</div>
        <div class="stat-tile__vs">Method awareness vs method use</div>
      </section>` : ''}
    </div>`;
}

// ─── SRR by department (comparison bar chart) ───────────────────────────────

function renderSrrBars(dept) {
  const srrKpi = dept.kpis.find((k) => k.id === 'srr_overall');
  const contributorIds = srrKpi ? srrKpi.contributors : [];
  const rows = contributorIds.map((cid) => {
    const k = dept.kpis.find((x) => x.id === cid);
    if (!k) return null;
    return { label: k.name.replace('SRR — ', ''), value: typeof k.actual === 'number' ? Math.round(k.actual * 100) : null };
  }).filter(Boolean);
  if (!rows.length) return '';

  const targetPct = srrKpi && srrKpi.target != null ? pct(srrKpi.target) : '100%';

  return `
    <section class="card card--pad" style="margin-bottom:24px">
      <span class="running-head">Strategic Review Rhythm (SRR) — by department</span>
      <p class="muted" style="margin:8px 0 16px; font-size:13.5px; line-height:1.55">
        Overall: <b class="tnum">${pct(srrKpi ? srrKpi.actual : null)}</b> adoption (target ${targetPct}).
        Operations is the only department running SRR (~50%); all others read 0% —
        confirm whether that is true non-adoption or not-yet-scored.
        <span class="badge badge--amber" style="margin-left:6px">Source: ODG FMDS Board</span>
      </p>
      <div style="overflow-x:auto">${svgBars(rows, { width: 520, barHeight: 22, gap: 7 })}</div>
      <p class="faint" style="font-size:11.5px; margin-top:6px">Values shown as % (0–100).</p>
    </section>`;
}

// ─── Training plan vs actual by program (comparison bar chart) ─────────────

function renderTrainingBars(dept) {
  const programs = dept.trainingPrograms || [];
  if (!programs.length) return '';

  const rows = programs.map((p) => ({
    label: p.name,
    value: typeof p.adoption === 'number' ? Math.round(p.adoption * 100) : null,
  }));

  return `
    <section class="card card--pad" style="margin-bottom:24px">
      <span class="running-head">Training plan vs actual — by program</span>
      <p class="muted" style="margin:8px 0 16px; font-size:13.5px; line-height:1.55">
        Monthly ramp target 10% per program; cumulative adoption (latest week) shown.
        FMDS and SRR (as a program) outperform; 8-Step and JIT/IDMP lag.
        <span class="badge badge--neutral" style="margin-left:6px">Source: ODG FMDS Board</span>
      </p>
      <div style="overflow-x:auto">${svgBars(rows, { width: 520, barHeight: 22, gap: 7 })}</div>
      <p class="faint" style="font-size:11.5px; margin-top:6px">Values shown as % (0–100). Monthly ramp target: 10%.</p>
    </section>`;
}

// ─── KZ tracker link ─────────────────────────────────────────────────────────

function renderKzLink(dept) {
  return `
    <section class="card card--pad" style="margin-bottom:24px">
      <span class="running-head">KZ / 8-step tracker</span>
      <p class="muted" style="margin:8px 0 16px; font-size:13.5px; line-height:1.55">
        The KZ tracker covers all departments. ODG provides support and oversight.
        Use Problem-Solving to browse by department, review progress, or open a new 8-step.
      </p>
      <a href="#/dept/${esc(dept.id)}/solve" class="btn btn--primary">Open KZ Tracker &amp; 8-Step Wizard →</a>
    </section>`;
}

// ─── Known data gaps ─────────────────────────────────────────────────────────

function renderGaps(dept) {
  if (!dept.gaps || !dept.gaps.length) return '';
  const items = dept.gaps.map((g) => `<li>${esc(g)}</li>`).join('');
  return `
    <section class="card card--pad" style="border-left:3px solid var(--amber)">
      <b style="font-size:13px; color:var(--amber-text)">Known data gaps</b>
      <ul class="muted" style="margin:10px 0 0; padding-left:18px; font-size:13px; line-height:1.7">${items}</ul>
    </section>`;
}

// ─── Public entry point ───────────────────────────────────────────────────────

function renderOdgHub(dept, mount) {
  mount.innerHTML = `
    <div class="page-head">
      <div>
        <span class="running-head page-head__eyebrow">${esc(dept.name)} · Adoption &amp; SRR</span>
        <h1>Method Hub</h1>
        <p class="page-head__sub">Training adoption, SRR, KZ tracker, SOP library</p>
      </div>
      <div class="page-head__side">
        <a href="#/dept/${esc(dept.id)}/kpi" class="btn btn--secondary">KPI View →</a>
      </div>
    </div>

    ${renderAdoptionHeadline(dept)}
    ${renderSrrBars(dept)}
    ${renderTrainingBars(dept)}
    ${renderKzLink(dept)}
    ${renderGaps(dept)}`;
}

;return { renderOdgHub };
})();

/* ==== views/overview.js ==== */
__M["views/overview.js"] = (function(){
/**
 * views/overview.js — Role-scoped RED/GREEN Overview surface
 *
 * renderOverview(dept, mount, session)
 *
 * Layout ported from docs/redesign/reference/view-overview.js (§5.1 of
 * docs/redesign/DESIGN-GUIDE.md) — a `.page-head` + a "Needs attention" hero
 * card per red/amber main KPI (Mark's grounded read as a `.ai-note` thread,
 * plus a "Review Draft 8-Step" note when a linked KZ exists) + an "On track"
 * `.stat-tile` grid for everything else. Wired to OUR data throughout: no
 * field is invented — anything the reference hardcodes for Operations (the
 * "86.3", "Mechanism B", "Jim Kozel" example) is derived here from dept.kpis,
 * dept.lead, kpi.story, kpi.rollupMethod, and data/kz-records.json so the
 * same renderer works for every department.
 *
 * L2 lead (and any role landing here for a non-Operations dept): the hero +
 *   stat-tile board described above, built from dept.kpis (the mains).
 *
 * L1 operator, Operations only: unchanged per-location target cards (no
 *   reference spec exists for this surface — Task 15 covers the L1 home
 *   surfaces proper). Re-skinned only to drop the old left-color-bar status
 *   convention in favor of the shared `.badge` treatment.
 */

const { mains } = __M["lib/registry.js"];
const { ragStatus } = __M["lib/rag.js"];
const { bakedReply } = __M["lib/agent.js"];
const { sparkline } = __M["lib/charts.js"];
const { byDept, progress } = __M["lib/eightstep.js"];

// ─── Formatters ────────────────────────────────────────────────────────────

function formatVal(v, unit) {
  if (v == null) return '—';
  if (typeof v !== 'number') return String(v);
  if (unit && (unit.startsWith('$') || unit.includes('$'))) {
    if (Math.abs(v) >= 1_000_000) return '$' + (v / 1_000_000).toFixed(2) + 'M';
    if (Math.abs(v) >= 1_000)     return '$' + (v / 1_000).toFixed(0) + 'k';
    return '$' + v.toLocaleString();
  }
  if (unit === 'ratio' || unit === 'percent' || unit === '%' || unit === 'pct') {
    return (v * 100).toFixed(1) + '%';
  }
  if (Math.abs(v) >= 1_000_000) return (v / 1_000_000).toFixed(2) + 'M';
  if (Math.abs(v) >= 1_000)     return (v / 1_000).toFixed(0) + 'k';
  return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function isPctUnit(unit) {
  return unit === 'ratio' || unit === 'percent' || unit === '%' || unit === 'pct';
}

// The 56px hero numeral needs the bare number split from its unit (the unit
// renders separately at 24px via <small>) — only done for percent-like units,
// which is what the reference itself does ("86.3" + small "%"). Every other
// unit just renders formatVal()'s full string with no split, since inventing
// a generic "number vs unit" split for units like "$/wk" or "pcs/hr" would
// either duplicate the $ sign or mangle magnitude abbreviations (k/M).
function heroValueParts(kpi) {
  if (kpi.actual == null) return { main: '—', small: '' };
  if (isPctUnit(kpi.unit)) return { main: (kpi.actual * 100).toFixed(1), small: '%' };
  return { main: formatVal(kpi.actual, kpi.unit), small: '' };
}

// Stat tiles are smaller (26px) — percent-like units get the whole formatted
// string (e.g. "73.4%") with no separate unit chip; other units append the
// dept's own unit label as the <small> suffix, UNLESS it's a $ unit (formatVal
// already renders the $ sign / k / M abbreviation, so a second unit chip would
// just repeat "$/wk" next to a number that already reads "$1.19M").
function tileValueParts(kpi) {
  if (kpi.actual == null) return { main: '—', small: '' };
  if (isPctUnit(kpi.unit)) return { main: formatVal(kpi.actual, kpi.unit), small: '' };
  const isDollar = typeof kpi.unit === 'string' && kpi.unit.includes('$');
  return { main: formatVal(kpi.actual, kpi.unit), small: isDollar ? '' : (kpi.unit || '') };
}

// A couple of departments' KPI `series` are flat number arrays (e.g.
// Operations: [0.948, 0.943, ...]); marketing.json instead stores
// `[{week,date,target,actual}, ...]`. sparkline() expects a flat numeric
// array, so normalize both shapes down to one here rather than teach the
// chart helper about department-specific data quirks.
function seriesNumbers(kpi) {
  const s = kpi.series;
  if (!Array.isArray(s)) return [];
  if (s.length && s[0] && typeof s[0] === 'object') {
    return s.map((pt) => (pt && typeof pt === 'object') ? (pt.actual ?? null) : pt);
  }
  return s;
}

function seriesLabels(kpi) {
  const s = kpi.series;
  if (Array.isArray(s) && s.length && s[0] && typeof s[0] === 'object') {
    return s.map((pt) => 'Wk ' + (pt && pt.week != null ? pt.week : '?'));
  }
  return seriesNumbers(kpi).map((_, i) => 'Wk ' + (i + 1));
}

// ─── RAG + badge ─────────────────────────────────────────────────────────────

function kpiRag(kpi) {
  if (kpi.nodata || kpi.actual == null || kpi.target == null) return 'nodata';
  return ragStatus(kpi.actual, kpi.target, kpi.direction || 'higher_better');
}

function statusBadge(rag) {
  const map = {
    green:  ['green',   'On Track'],
    amber:  ['amber',   'At Risk'],
    red:    ['red',     'Off Track'],
    nodata: ['outline', 'No Data'],
  };
  const [cls, label] = map[rag] || map.nodata;
  const dot = rag === 'nodata' ? '' : '<span class="dot"></span>';
  return `<span class="badge badge--${cls}">${dot}${label}</span>`;
}

// ─── Source note + vs-target lines ──────────────────────────────────────────

function sourceNoteFor(kpi) {
  const parts = [];
  if (kpi.source) parts.push(kpi.source.split(' / ')[0]);
  if (kpi.targetSource) parts.push('target from ' + kpi.targetSource);
  return parts.join(' · ');
}

// The hero card's "vs target X · <mechanism/context>" line. The mechanism
// clause is the KPI's own T3-story note when one exists (Operations' OTP is
// the only KPI with this much narrative depth); otherwise it's a plain-English
// read of the KPI's real `rollupMethod` field — never an invented narrative.
function mechanismContext(kpi) {
  if (kpi.story && kpi.story.mechanismNote) return kpi.story.mechanismNote;
  const labels = {
    independent: 'main entered independently',
    sum:         'sum of contributing KPIs',
    avg:         'average of contributing KPIs',
    manual:      'manually entered',
    external:    'external report',
  };
  return kpi.rollupMethod && labels[kpi.rollupMethod] ? labels[kpi.rollupMethod] : null;
}

function heroVsLine(kpi) {
  const targetDisplay = kpi.target != null ? formatVal(kpi.target, kpi.unit) : '—';
  const mech = mechanismContext(kpi);
  return `vs target <b>${targetDisplay}</b>${mech ? ' · ' + mech : ''}`;
}

function tileVsLine(kpi) {
  if (kpi.target == null) return 'No target set';
  const targetDisplay = formatVal(kpi.target, kpi.unit);
  const dirNote = kpi.direction === 'lower_better' ? 'lower is better' : 'higher is better';
  return `vs target ${targetDisplay} · ${dirNote}`;
}

// ─── Mark's "what's driving this" explanation ───────────────────────────────
//
// Combines (in order of groundedness):
//  1. The KPI's own `story.text` (+ `story.denominatorNote`) — richest, most
//     grounded (currently only Operations' OTP has this depth of narrative).
//  2. `kpi.flagDetail` / a short `kpi.flag` string.
//  3. `kpi.rollup.note` — roll-up/entry-mechanic note, appended if present.
//  4. Falls back to the dept-level `bakedReply('explain-red', ...)` template
//     when the KPI itself carries no grounded text.
function kpiAgentExplanation(dept, kpi) {
  const parts = [];

  if (kpi.story && kpi.story.text) {
    parts.push(kpi.story.text);
    if (kpi.story.denominatorNote) parts.push(`Denominator note: ${kpi.story.denominatorNote}`);
  } else if (kpi.flagDetail) {
    parts.push(kpi.flagDetail);
  } else if (kpi.flag && typeof kpi.flag === 'string' && kpi.flag.length < 200) {
    parts.push(kpi.flag);
  }

  if (kpi.rollup && kpi.rollup.note) {
    parts.push(`Entry mechanic: ${kpi.rollup.note}`);
  }

  if (!parts.length) {
    const reply = bakedReply(dept.id, 'explain-red', { kpi: kpi.name });
    parts.push(reply.replace(/^Why is [^\n]+\?\n\n/, '').trim());
  }

  return parts.filter(Boolean).join('\n\n');
}

// ─── Hero card (red/amber headline KPI) ────────────────────────────────────

function buildHeroCard(dept, kpi) {
  const rag = kpiRag(kpi);
  const { main, small } = heroValueParts(kpi);
  const spark = sparkline(seriesNumbers(kpi), {
    w: 380, h: 88, target: kpi.target,
    name: `${kpi.name} weekly`, labels: seriesLabels(kpi), fmt: kpi.unit,
  }).replace('<svg class="spark"', '<svg class="spark" style="width:100%;height:auto"');
  const sourceNote = sourceNoteFor(kpi);
  const explanation = kpiAgentExplanation(dept, kpi);
  const paragraphs = explanation.split('\n\n').filter(Boolean).map((p) => `<p>${p}</p>`).join('');

  return `
    <section class="card hero-kpi" aria-label="${kpi.name} headline KPI">
      <div class="hero-kpi__main">
        <div class="hero-kpi__label">
          <h3>${kpi.name}</h3>
          ${statusBadge(rag)}
        </div>
        <div class="hero-kpi__value">${main}${small ? `<small>${small}</small>` : ''}</div>
        <div class="hero-kpi__vs">${heroVsLine(kpi)}</div>
        <div style="flex:1; display:flex; align-items:center; min-height:80px">${spark}</div>
        <div class="hero-kpi__foot">
          ${sourceNote ? `<span class="source-note">${sourceNote}</span>` : '<span></span>'}
          <button class="btn btn--ghost btn--sm" data-go="kpi">Open in KPI Boards →</button>
        </div>
      </div>
      <div class="hero-kpi__side" data-kz-side="${dept.id}::${kpi.id}">
        <div class="ai-note">
          <div class="ai-note__avatar">M</div>
          <div class="ai-note__body">
            <div class="ai-note__head">
              <b>Mark</b><span class="muted">AI Employee</span>
              <span class="running-head" style="color:var(--accent-text)">What's driving this</span>
            </div>
            <div class="ai-note__text">${paragraphs}</div>
          </div>
        </div>
      </div>
    </section>`;
}

// ─── Stat tile (on-track / no-data KPI) ────────────────────────────────────

function buildStatTile(dept, kpi) {
  const rag = kpiRag(kpi);
  const { main, small } = tileValueParts(kpi);
  const spark = sparkline(seriesNumbers(kpi), {
    w: 280, h: 40, target: kpi.target, name: kpi.name, labels: seriesLabels(kpi), fmt: kpi.unit,
  });
  const sourceNote = sourceNoteFor(kpi);

  return `
    <section class="card stat-tile">
      <div class="stat-tile__top">
        <span class="stat-tile__label">${kpi.name}</span>
        ${statusBadge(rag)}
      </div>
      <div class="stat-tile__value">${main}${small ? `<small>${small}</small>` : ''}</div>
      <div class="stat-tile__vs">${tileVsLine(kpi)}</div>
      <div class="stat-tile__spark">${spark}</div>
      <div class="hero-kpi__foot" style="padding-top:8px">
        ${sourceNote ? `<span class="source-note">${sourceNote}</span>` : '<span></span>'}
        <button class="btn btn--ghost btn--sm" data-go="kpi">Open in KPI Boards →</button>
      </div>
    </section>`;
}

// ─── "Review Draft 8-Step" note — deep-opens the dept's linked KZ ──────────
//
// Finds the open (not-closed) KZ record — from data/kz-records.json — linked
// (via `linkedKpiId`) to this headline KPI or one of its contributors (sub-
// KPIs). For Operations' OTP that resolves to KZ-346 (linked to the
// otp_mexico contributor); most other departments have no such record, so
// the note is simply omitted — never fabricated. When more than one open KZ
// matches, the furthest-along draft (most steps confirmed) wins.
function findLinkedKz(records, dept, kpi) {
  const candidateIds = new Set([kpi.id, ...(kpi.contributors || [])]);
  const matches = byDept(records, dept.id)
    .filter((r) => !r.closed && r.linkedKpiId && candidateIds.has(r.linkedKpiId));
  if (!matches.length) return null;
  matches.sort((a, b) => progress(b).done - progress(a).done);
  return matches[0];
}

function kzNoteHTML(kz) {
  const p = progress(kz);
  const title = kz.title || kz.item || kz.kzNumber;
  const who = kz.who ? `owned by ${kz.who}, ` : '';
  return `
    <div class="ai-note">
      <div class="ai-note__avatar">M</div>
      <div class="ai-note__body">
        <div class="ai-note__head"><b>Mark</b></div>
        <div class="ai-note__text">
          <p>I've pre-drafted an 8-step on this — <b>${kz.kzNumber}</b>, "${title}" (${who}${p.done}/8 steps confirmed). It's waiting in Problem-Solving.</p>
        </div>
        <div style="margin-top:8px">
          <button class="btn btn--outline btn--sm" data-go-kz="${kz.kzNumber}" data-go-kpi="${kz.linkedKpiId || ''}">Review Draft 8-Step</button>
        </div>
      </div>
    </div>`;
}

// Fire-and-forget, same pattern as the old Hoshin-strip splice: the board
// already painted synchronously (dispatchView() never awaits renderOverview),
// so once data/kz-records.json resolves we splice the second note into the
// matching hero card's `.hero-kpi__side`. No-ops gracefully with no `fetch`
// global (Node tests) or if the mount has since been replaced/navigated away.
async function injectKzDraftNotes(dept, mount, headlineKpis) {
  if (!headlineKpis.length || typeof fetch !== 'function') return;
  let records;
  try {
    const res = await fetch('data/kz-records.json');
    records = await res.json();
  } catch { return; }
  if (!mount.isConnected) return;

  headlineKpis.forEach((kpi) => {
    const kz = findLinkedKz(records, dept, kpi);
    if (!kz) return;
    const host = mount.querySelector(`[data-kz-side="${dept.id}::${kpi.id}"]`);
    if (host) host.insertAdjacentHTML('beforeend', kzNoteHTML(kz));
  });
}

// ─── L2 (+ default) main-KPI overview ──────────────────────────────────────

function renderBoardOverview(dept, mount, role) {
  const kpiList = mains(dept);
  const order = { red: 0, amber: 1, green: 2, nodata: 3 };
  const withRag = kpiList
    .map((kpi) => ({ kpi, rag: kpiRag(kpi) }))
    .sort((a, b) => order[a.rag] - order[b.rag]);

  const headline = withRag.filter((x) => x.rag === 'red' || x.rag === 'amber');
  const rest     = withRag.filter((x) => x.rag === 'green' || x.rag === 'nodata');

  const redCount = headline.filter((x) => x.rag === 'red').length;
  const attentionCount = headline.length;
  const subheading = attentionCount > 0
    ? `${attentionCount} KPI${attentionCount > 1 ? 's' : ''} need${attentionCount === 1 ? 's' : ''} attention`
    : 'All KPIs on track or no active issues';

  const needsAttentionHtml = headline.length ? `
    <div class="section-head" style="margin-top:0"><span class="running-head">Needs attention</span></div>
    ${headline.map((x) => buildHeroCard(dept, x.kpi)).join('')}` : '';

  const onTrackHtml = rest.length ? `
    <div class="section-head"${headline.length ? '' : ' style="margin-top:0"'}><span class="running-head">On track</span></div>
    <div class="stat-grid">${rest.map((x) => buildStatTile(dept, x.kpi)).join('')}</div>` : '';

  mount.innerHTML = `
    <div class="page-head">
      <div>
        <span class="running-head page-head__eyebrow">${dept.name} · Team Board</span>
        <h1>Overview</h1>
        <p class="page-head__sub">${role} · ${dept.lead || 'Lead'} · ${subheading}</p>
      </div>
      <div class="page-head__side">
        <button class="btn btn--secondary" data-go="sources">Sources</button>
        <button class="btn btn--primary" data-go="kpi">Open KPI Boards →</button>
      </div>
    </div>
    ${needsAttentionHtml}
    ${onTrackHtml}
    ${!kpiList.length ? '<p class="muted">No KPI data available.</p>' : ''}
    <p class="board-hint"><b>Overview</b> shows department main KPIs by status. Red and amber cards include Mark's grounded explanation. Use <b>KPI Boards</b> for the full level-by-level breakdown with trends and operator contributions.</p>`;

  // Router hooks: data-go → view (kpi/sources); data-go-kz → solve, opening
  // the linked KZ via the SAME `?kpi=<id>&kz=<kzNumber>` handoff Ask Mark's
  // escalation flow already uses (views/problemsolving.js resolves the real
  // KZ record and lands on its first unconfirmed step) — never a hardcoded
  // step number.
  mount.addEventListener('click', (e) => {
    const goBtn = e.target.closest('[data-go]');
    if (goBtn) {
      location.hash = `#/dept/${dept.id}/${goBtn.dataset.go}`;
      return;
    }
    const kzBtn = e.target.closest('[data-go-kz]');
    if (kzBtn) {
      const kzNumber = kzBtn.dataset.goKz;
      const kpiId = kzBtn.dataset.goKpi || '';
      location.hash = `#/dept/${dept.id}/solve?kpi=${encodeURIComponent(kpiId)}&kz=${encodeURIComponent(kzNumber)}`;
    }
  });

  injectKzDraftNotes(dept, mount, headline.map((x) => x.kpi));

  return { redCount };
}

// ─── L1 per-location target view (Operations path) ─────────────────────────

/**
 * For an L1 Operations operator: show the location board KPIs they own. No
 * reference layout exists for this surface (Task 15 covers the L1 home
 * surfaces) — kept behaviorally identical to before, re-skinned only to
 * replace the old left-color-bar status convention with the shared `.badge`
 * (state lives in the badge everywhere else in the redesign; this surface
 * shouldn't be the one holdout).
 */
function renderL1OperationsOverview(dept, mount, persona) {
  const locId = persona && persona.location
    ? persona.location.toLowerCase()
    : (dept.locations && dept.locations[0]) || null;

  const locBoard = locId && dept.locationBoards && dept.locationBoards[locId]
    ? dept.locationBoards[locId]
    : null;

  if (!locBoard) {
    renderBoardOverview(dept, mount, 'L1');
    return;
  }

  const otpKpi  = locBoard.kpis.find((k) => k.category === 'SERVICE/DELIVERY' && k.name.includes('OTP'));
  const pplhKpi = locBoard.kpis.find((k) => k.category === 'COST' && k.name === 'PPLH');

  const makeL1Tile = (kpi) => {
    if (!kpi) return '';
    const isNoData = kpi.nodata || kpi.actual == null;
    const rag = isNoData ? 'nodata' : ragStatus(kpi.actual, kpi.target, kpi.direction || 'higher_better');

    return `
      <section class="card stat-tile">
        <div class="stat-tile__top">
          <span class="stat-tile__label">${kpi.category} · ${kpi.name}</span>
          ${statusBadge(rag)}
        </div>
        <div class="stat-tile__value">${isNoData ? '—' : formatVal(kpi.actual, kpi.unit)}</div>
        <div class="stat-tile__vs">
          Target: ${kpi.target != null ? formatVal(kpi.target, kpi.unit) : '—'}${kpi.latestMonth ? ` · Latest: ${kpi.latestMonth}` : ''}
        </div>
        ${kpi.unitNote ? `<div class="stat-tile__vs" style="color:var(--amber-text)">${kpi.unitNote}</div>` : ''}
      </section>`;
  };

  mount.innerHTML = `
    <div class="page-head">
      <div>
        <span class="running-head page-head__eyebrow">${dept.name} · My Targets</span>
        <h1>Overview</h1>
        <p class="page-head__sub">L1 · ${locBoard.label} · ${locBoard.productionLines ? locBoard.productionLines.length : '—'} production lines</p>
      </div>
      <div class="page-head__side">
        <button class="btn btn--primary" data-go="kpi">Open KPI Boards →</button>
      </div>
    </div>
    <div class="stat-grid" style="margin-top:0">
      ${makeL1Tile(otpKpi)}
      ${makeL1Tile(pplhKpi)}
    </div>
    ${locBoard.actualsNote ? `<p class="board-hint">${locBoard.actualsNote}</p>` : ''}
    <p class="board-hint">Your targets for <b>${locBoard.label}</b>. Use <b>KPI Boards</b> for the full location breakdown.</p>`;

  mount.addEventListener('click', (e) => {
    const goBtn = e.target.closest('[data-go]');
    if (goBtn) location.hash = `#/dept/${dept.id}/${goBtn.dataset.go}`;
  });
}

// ─── Public entry point ─────────────────────────────────────────────────────

/**
 * renderOverview(dept, mount, session)
 *
 * session — { role: 'L1' | 'L2', persona: { name, label, location? } }
 *   Pass null/undefined session to default to L2 rendering.
 */
function renderOverview(dept, mount, session) {
  const role = session && session.role ? session.role : 'L2';

  if (role === 'L1' && dept.id === 'operations') {
    renderL1OperationsOverview(dept, mount, session ? session.persona : null);
  } else {
    renderBoardOverview(dept, mount, role);
  }
}

;return { renderOverview };
})();

/* ==== views/problemsolving.js ==== */
__M["views/problemsolving.js"] = (function(){
/**
 * views/problemsolving.js — 8-Step Problem-Solving View (the centerpiece)
 *
 * renderProblemSolving(dept, mount)
 *
 * Three surfaces (kept distinct — per spec & the Jul-3 client call):
 *   1. Tracker table — all KZ records for this dept. The 5 REAL completed KZs
 *      (KZ-327/328/342/352/364) open a full read-only A3. Others open the
 *      walkthrough.
 *   2. Read-view — full filled A3 (all 8 steps) for a completed KZ that carries
 *      rich `content`.
 *   3. Agent-prefilled wizard — triggered by a RED SUB-KPI. Steps 1-6 open with
 *      an "AI draft — review & edit" block already populated (lib/agent.draftStep),
 *      grounded in the red KPI + a governing SOP + a prior similar KZ. Step 4 is a
 *      5-Whys ladder + 6M fishbone; step 5 is the countermeasure scoring matrix;
 *      step 6 has the ODG gate; step 8 writes back to the SOP library.
 *
 * SOPs are the INPUT to steps 1-5 and the OUTPUT of step 8 (Yokoten).
 */

const { byDept, newKZ, progress } = __M["lib/eightstep.js"];
const { contributorsOf, mains, byId } = __M["lib/registry.js"];
const { ragStatus } = __M["lib/rag.js"];
const { draftStep, liveReply } = __M["lib/agent.js"];
const { svgFunnel, stepChart, paretoBars } = __M["lib/charts.js"];

// ─── State (module-level, reset each render) ─────────────────────────────────
let _activeKZ     = null;   // the KZ being solved in the wizard
let _readKZ       = null;   // a completed KZ being viewed read-only
let _currentStep  = 1;      // 1–8 (the wizard page shown)
let _stepData     = {};     // user-entered values per step
let _kzRecords    = [];     // all records for this dept
let _template     = null;   // eightstep-template.json
let _dept         = null;
let _mount        = null;
let _sopWrittenBack = false; // step-8 write-back toggle for the active KZ
let _markStepHelp = null;   // docked Mark co-pilot: current step's proactive suggestion set

// ─── Helpers ─────────────────────────────────────────────────────────────────

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function ragChip(status) {
  const label = { green: 'On Track', amber: 'At Risk', red: 'Off Track', nodata: 'No Data' }[status] || status;
  return `<span class="status-cell status-cell--${status}"><span class="dot"></span>${label}</span>`;
}

// RAG → the correctly-calibrated "-text" tier token for inline prose (never
// the base --green/--amber/--red token as a text color — see design-system
// spec §1's AA rule).
function ragTextVar(status) {
  return { green: 'var(--green-text)', amber: 'var(--amber-text)', red: 'var(--red-text)', nodata: 'var(--text-faint)' }[status] || 'var(--text)';
}

function formatVal(v, unit) {
  if (v == null) return '—';
  if (typeof v !== 'number') return String(v);
  if (unit && unit.includes('$')) {
    if (Math.abs(v) >= 1_000_000) return '$' + (v / 1_000_000).toFixed(2) + 'M';
    if (Math.abs(v) >= 1_000)     return '$' + (v / 1_000).toFixed(0) + 'k';
    return '$' + v.toLocaleString();
  }
  if (unit === 'ratio' || unit === 'percent' || unit === '%' || unit === 'pct') return (v * 100).toFixed(1) + '%';
  if (Math.abs(v) >= 1_000) return v.toLocaleString();
  return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

// KZs that carry full completed A3 content (rendered as read-view).
function isCompletedA3(kz) {
  return !!(kz && kz.content && kz.closed);
}

// Steps the agent pre-solves.
const AI_STEPS = [1, 2, 3, 4, 5, 6];

// ─── Step-dot progress strip ─────────────────────────────────────────────────

function stepDotStrip(kz, clickable = false, activeStep = null) {
  const steps = kz.steps || {};
  const dots = Array.from({ length: 8 }, (_, i) => {
    const n    = i + 1;
    const done = !!steps[String(n)];
    const isActive = activeStep === n;
    const cls  = ['step-track__dot', done ? 'is-done' : '', isActive ? 'is-next' : ''].filter(Boolean).join(' ');
    return clickable
      ? `<button type="button" class="${cls}" onclick="window._psGotoStep(${n})" title="Step ${n}">${n}</button>`
      : `<span class="${cls}" title="Step ${n}: ${done ? 'done' : 'not done'}">${n}</span>`;
  }).join('');
  return `<span class="step-track">${dots}</span>`;
}

// Horizontal 8-step wizard nav (artifact §3.8's .step-bar/.step-tab) — each
// tab shows its PDCA phase + name + done/active state, and is the single
// step-navigation surface for the wizard (the tracker table and read-only A3
// keep the compact stepDotStrip() above).
function renderStepBar(template, kz, activeStep) {
  const steps = (template && template.steps) || [];
  return steps.map(st => {
    const done = !!(kz && kz.steps && kz.steps[String(st.n)]);
    const active = activeStep === st.n;
    const cls = ['step-tab', active ? 'is-active' : '', done ? 'is-done' : ''].filter(Boolean).join(' ');
    return `
      <button type="button" class="${cls}" onclick="window._psGotoStep(${st.n})" aria-current="${active ? 'step' : 'false'}">
        <span class="step-tab__n">${done ? '✓' : st.n}</span>
        <span class="step-tab__name">${esc(st.name)}</span>
        <span class="step-tab__pdca">${esc(st.pdca)}</span>
      </button>`;
  }).join('');
}

// ─── Golden-thread — `.kz-meta` header row (main → sub) ───────────────────────
// Rendered once, atop the wizard, as the artifact's `.kz-meta` row — pill
// chips + divider ticks, tabular nums, nothing wraps mid-value. Replaces the
// old inline page-head__sub sentence AND the old separate AI-draft/golden-
// thread boxes: per design-system spec §5.5, this row (plus a right-aligned
// source-note inside the step body) is the ONLY place that info lives — no
// banner box restating it.

function goldenThreadChips(dept, kpi) {
  if (!kpi || !dept.kpis) return [];
  const chips = [];

  // Dept main (parent of this sub-KPI if one exists, else first main)
  const parent = kpi.parentId ? byId(dept, kpi.parentId) : null;
  const mainKpi = parent || mains(dept)[0];
  if (mainKpi) {
    const rag = ragStatus(mainKpi.actual, mainKpi.target, mainKpi.direction || 'higher_better');
    chips.push(`<span class="kz-meta__item kz-meta__chip">${esc(mainKpi.name)} <b style="color:${ragTextVar(rag)}">${formatVal(mainKpi.actual, mainKpi.unit)}</b></span>`);
  }

  // The specific (sub) KPI that triggered the 8-step
  if (kpi && kpi !== mainKpi) {
    const rag = ragStatus(kpi.actual, kpi.target, kpi.direction || 'higher_better');
    chips.push(`<span class="kz-meta__item kz-meta__chip">${esc(kpi.name)} <b style="color:${ragTextVar(rag)}">${formatVal(kpi.actual, kpi.unit)}</b> <span class="faint">vs ${formatVal(kpi.target, kpi.unit)}</span></span>`);
  }

  return chips;
}

function renderKzMeta(dept, kz, kpi) {
  const segs = [`<span class="kz-meta__item">Owner <b>${kz.who ? esc(kz.who) : '—'}</b></span>`];

  const chips = goldenThreadChips(dept, kpi);
  if (chips.length) {
    segs.push('<span class="kz-meta__sep"></span>');
    segs.push('<span class="kz-meta__item">Golden Thread</span>');
    chips.forEach((chip) => {
      segs.push(chip);
      segs.push('<span class="kz-meta__arrow">▸</span>');
    });
    segs.push('<span class="kz-meta__item">opens this 8-step</span>');
  }

  segs.push('<span class="kz-meta__sep"></span>');
  // Only claim "steps 1-6 pre-solved" once at least one of them is actually
  // confirmed done — a freshly-opened draft (0/8, e.g. from a red-sub-KPI
  // candidate row) has AI-drafted CONTENT available (draftStep() runs live,
  // every render) but nothing pre-solved/confirmed yet, so it gets the
  // honest "not yet confirmed" copy instead of implying finished work exists.
  const aiConfirmed = AI_STEPS.filter((n) => !!(kz.steps && kz.steps[String(n)])).length;
  const aiBadgeText = aiConfirmed > 0
    ? `AI draft · steps 1–6 pre-solved · ${aiConfirmed} confirmed`
    : 'AI draft — not yet confirmed';
  segs.push(`<span class="badge badge--info"><span class="dot"></span>${aiBadgeText}</span>`);

  return `<div class="kz-meta">${segs.join('')}</div>`;
}

// Grounded, per-step provenance line (right-aligned inside the step head) —
// replaces the old per-step "AI draft — review & edit" banner box. Only
// shown on the steps the agent actually pre-solves (AI_STEPS); steps 7/8
// are captured after implementation, never drafted, so no note is fabricated
// for them.
function stepSourceNote(kpi, prior, sop, currentKzNumber) {
  const parts = [];
  if (kpi && kpi.name) parts.push(`red KPI "${esc(kpi.name)}"`);
  if (prior && prior.kzNumber && prior.kzNumber !== currentKzNumber) parts.push(`prior similar ${esc(prior.kzNumber)}`);
  if (sop && sop.title) parts.push(`SOP "${esc(sop.title)}"`);
  if (!parts.length) return '';
  return `Drafted from ${parts.join(' · ')}`;
}

// ─── Tracker table ────────────────────────────────────────────────────────────

// Honest stall/age flag: a KZ record carries no per-step timestamps, only a
// single real `start` date — so the only fact we can report is "how many
// whole days has this been open" against the real `start`, never a fabricated
// "stalled at step k" moment. Closed KZs and KZs with no `start` on file never
// flag (there is no fact to flag from).
const STALL_DAYS = 14;

function stallInfo(kz) {
  if (!kz || kz.closed || !kz.start) return null;
  const start = new Date(kz.start);
  if (Number.isNaN(start.getTime())) return null;
  const days = Math.floor((Date.now() - start.getTime()) / 86_400_000);
  if (days < STALL_DAYS) return null;
  const done = progress(kz).done;
  if (done >= 8) return null;
  return { days, done };
}

// Linked red KPI — ties a KZ back to the board KPI it exists to fix (Task 5's
// `linkedKpiId`). Closed KZs whose linked KPI has since gone green are called
// out as "resolved"; everything else just shows the KPI's live RAG chip so a
// KZ that's closed-but-still-red (or open-but-already-green) reads honestly.
function linkedKpiCell(kz, dept) {
  const kpi = kz.linkedKpiId ? byId(dept, kz.linkedKpiId) : null;
  if (!kpi) return '<span class="text-muted" style="font-size:0.78rem">—</span>';
  const rag = ragStatus(kpi.actual, kpi.target, kpi.direction || 'higher_better');
  const chip = (kz.closed && rag === 'green')
    ? `<span class="status-cell status-cell--green"><span class="dot"></span>✓ Resolved</span>`
    : ragChip(rag);
  return `
    <div style="font-size:0.8rem;font-weight:500;line-height:1.3;margin-bottom:2px">${esc(kpi.name)}</div>
    ${chip}`;
}

// ─── AI-draft KZ detector (tracker banner + row) ──────────────────────────
// "AI-drafted 8-step ready for review" is real, derived state, never a
// hardcoded KZ number: a KZ qualifies when the agent has finished exactly
// the steps it's scoped to pre-solve (AI_STEPS, 1–6), the human hasn't
// closed out 7–8 yet, and it's linked (linkedKpiId) to a KPI that's
// currently red or amber. This is the same red-sub-KPI-triggered signal
// views/overview.js's findLinkedKz() / lib/agent.js's liveReply() / the
// accountability seed all key off of (see tests/agent-live.test.mjs's
// "liveReply surfaces the REAL linked open 8-step (KZ-346 → otp_mexico)"
// case) — it just happens that KZ-346/Operations is the only record on file
// that currently matches, so the banner naturally appears only there.
function resolveAiDraftKz(dept, records) {
  const candidates = records.filter((kz) => {
    if (kz.closed || !kz.linkedKpiId) return false;
    const steps = kz.steps || {};
    if (!AI_STEPS.every((n) => steps[String(n)])) return false;
    if (steps['7'] || steps['8']) return false;
    const kpi = byId(dept, kz.linkedKpiId);
    if (!kpi) return false;
    const rag = ragStatus(kpi.actual, kpi.target, kpi.direction || 'higher_better');
    return rag === 'red' || rag === 'amber';
  });
  if (!candidates.length) return null;
  candidates.sort((a, b) => progress(b).done - progress(a).done);
  return candidates[0];
}

// Honest "not started yet" AI-draft candidates — computed LIVE from every red/
// amber sub-KPI (subKpis(), same filter renderRedKpiSelector already uses)
// that has no OPEN KZ already linked to it. Unlike resolveAiDraftKz() above
// (which only matches a PERSISTED record whose steps 1–6 are already marked
// done — real seed data like Operations' KZ-346), this never claims any step
// is pre-solved: it only surfaces the real kpiId/kpiName/rag so a dept with
// zero KZ records on file (Service) can still show clickable, honest
// "ready to draft" tracker rows and an honest count. Exported so tests can
// exercise it directly against real data/*.json fixtures (no DOM/fetch
// needed — see tests/problemsolving-view.test.mjs).
function aiDraftCandidatesFromRedKpis(dept, records) {
  return subKpis(dept)
    .filter((kpi) => {
      const rag = ragStatus(kpi.actual, kpi.target, kpi.direction || 'higher_better');
      if (rag !== 'red' && rag !== 'amber') return false;
      return !records.some((kz) => kz.linkedKpiId === kpi.id && !kz.closed);
    })
    .map((kpi) => ({
      kpiId: kpi.id,
      kpiName: kpi.name,
      rag: ragStatus(kpi.actual, kpi.target, kpi.direction || 'higher_better'),
    }));
}

// One tracker row for a not-yet-started AI-draft candidate — styled like the
// real AI-draft row above (sage tint, "AI draft ready" chip) but HONEST about
// there being no progress yet: KZ# reads "Draft" (nothing has been minted or
// numbered), Progress shows 0/8, and Status reads "Ready to draft" rather
// than any completed-step language. The whole row is clickable (data-open-
// ai-draft carries the real kpiId) and reuses the exact same _psOpenWizard()
// path the sidebar red-KPI <select> already uses — no separate code path.
function candidateRowHTML(candidate) {
  return `
    <tr class="ps-candidate-row" data-open-ai-draft="${esc(candidate.kpiId)}" style="background:hsl(var(--action-1));cursor:pointer">
      <td>
        <div style="font-weight:500;font-size:0.875rem">${esc(candidate.kpiName)} <span class="chip" style="border-color:hsl(var(--action-4));background:var(--panel);color:var(--accent-text)">AI draft ready</span></div>
        <div class="faint" style="font-size:0.75rem">Not started — no 8-step on file yet</div>
      </td>
      <td class="text-mono muted" style="white-space:nowrap">Draft</td>
      <td class="muted" style="font-size:0.875rem">—</td>
      <td>
        <div style="font-size:0.8rem;font-weight:500;line-height:1.3;margin-bottom:2px">${esc(candidate.kpiName)}</div>
        ${ragChip(candidate.rag)}
      </td>
      <td><span class="faint">—</span></td>
      <td class="muted tnum" style="white-space:nowrap">—</td>
      <td>
        ${stepDotStrip({ steps: {} })}
        <span class="faint tnum" style="font-size:11.5px;margin-left:6px">0/8</span>
      </td>
      <td><span class="badge badge--neutral">Ready to draft</span></td>
      <td style="text-align:right"><button class="btn btn--outline btn--sm">Open 8-Step</button></td>
    </tr>`;
}

// Lightweight sage banner for a dept that has red-sub-KPI AI-draft candidates
// but no PERSISTED AI-draft-ready KZ (resolveAiDraftKz found none) — e.g.
// Service, which has 0 KZ records on file today. Deliberately worded to
// never claim pre-solved content: Mark CAN draft an 8-step from the top
// candidate, not "steps 1–6 already done".
function renderAiDraftCandidateBanner(dept, candidate) {
  return `
    <section class="card ai-draft-banner">
      <div class="ai-note__avatar" style="width:36px;height:36px;font-size:15px">M</div>
      <div style="flex:1;min-width:0">
        <b style="font-size:13.5px">Mark can draft an 8-step for ${esc(candidate.kpiName)}</b>
        <div class="muted" style="font-size:12.5px;margin-top:2px">This red sub-KPI has no 8-step on file yet — open to review the AI draft for steps 1–6 and confirm as you go.</div>
      </div>
      <button class="btn btn--primary" data-open-ai-draft="${esc(candidate.kpiId)}">Review AI Draft →</button>
    </section>`;
}

// Grounded one-liner for the banner — built only from fields the app already
// resolves elsewhere for this exact KZ (the linked KPI, the governing SOP
// step 8 would write back to, a prior completed KZ) so nothing here is
// invented; any piece that doesn't resolve is simply omitted.
function renderAiDraftBanner(dept, kz) {
  const kpi = kz.linkedKpiId ? byId(dept, kz.linkedKpiId) : null;
  const title = kz.title || kz.item || kz.kzNumber;
  const sop = govSop(dept);
  const prior = priorSimilarKZ(dept);
  const grounded = [];
  if (sop && sop.title) grounded.push(`the ${esc(sop.title)} SOP`);
  if (prior && prior.kzNumber && prior.kzNumber !== kz.kzNumber) grounded.push(`prior similar ${esc(prior.kzNumber)}`);
  let note = `Mark pre-solved planning steps 1–6 from the red ${esc(kpi ? kpi.name : 'linked')} sub-KPI`;
  note += grounded.length ? `, grounded in ${grounded.join(' and ')}.` : '.';
  note += ' You review, edit and confirm.';

  return `
    <section class="card ai-draft-banner">
      <div class="ai-note__avatar" style="width:36px;height:36px;font-size:15px">M</div>
      <div style="flex:1;min-width:0">
        <b style="font-size:13.5px">AI-drafted 8-step ready for review — ${esc(kz.kzNumber)} · ${esc(title)}</b>
        <div class="muted" style="font-size:12.5px;margin-top:2px">${note}</div>
      </div>
      <button class="btn btn--primary" data-go-kz="${esc(kz.kzNumber)}" data-go-kpi="${esc(kz.linkedKpiId || '')}">Review Draft 8-Step →</button>
    </section>`;
}

function renderTrackerTable(records, dept, aiDraftKz, candidates = []) {
  if (!records.length && !candidates.length) {
    return `<p class="muted" style="padding:16px 0">No 8-step records for ${esc(dept.name)} yet.</p>`;
  }

  const rows = records.map((kz, idx) => {
    const p = progress(kz);
    const completed = isCompletedA3(kz);
    const stall = stallInfo(kz);
    const isAiDraft = !!aiDraftKz && kz === aiDraftKz;
    const statusBadge = kz.closed
      ? `<span class="badge badge--green"><span class="dot"></span>Closed</span>`
      : kz.active
        ? `<span class="badge badge--info"><span class="dot"></span>Active</span>`
        : `<span class="badge badge--neutral">—</span>`;
    const stallFlag = stall
      ? `<div class="stall-flag" title="Open since ${esc(kz.start)} — no per-step timestamps on file, age is measured from the real start date">open ${stall.days}d · step ${stall.done}/8</div>`
      : '';
    const odgCell = kz.odgSupport
      ? `<span class="badge badge--neutral" style="font-size:10.5px">ODG</span>`
      : `<span class="faint">—</span>`;
    const actionCell = completed
      ? `<button class="btn btn--ghost btn--sm" onclick="window._psOpenRead(${idx})">View A3 →</button>`
      : isAiDraft
        ? `<button class="btn btn--outline btn--sm" data-go-kz="${esc(kz.kzNumber)}" data-go-kpi="${esc(kz.linkedKpiId || '')}">Open 8-Step</button>`
        : '';
    const aiTag = isAiDraft
      ? ` <span class="chip" style="border-color:hsl(var(--action-4));background:var(--panel);color:var(--accent-text)">AI draft ready</span>`
      : '';
    const a3Tag = completed ? ' <span class="badge badge--accent" style="font-size:9.5px">A3</span>' : '';

    // A closed-at-step-8 record minted live from newKZ() carries kzNumber:
    // null (no real sequential number has ever been allocated — see
    // lib/eightstep.js's newKZ) — show the honest "Draft" label rather than
    // an empty cell, never a fabricated number.
    const kzNumberLabel = kz.kzNumber || 'Draft';

    return `
      <tr${isAiDraft ? ' style="background:hsl(var(--action-1))"' : ''}>
        <td>
          <div style="font-weight:500;font-size:0.875rem">${esc(kz.title || kz.kzNumber || kzNumberLabel)}${a3Tag}${aiTag}</div>
          ${kz.title && kz.kzNumber && kz.title !== kz.kzNumber ? `<div class="faint" style="font-size:0.75rem">${esc(kz.kzNumber)}</div>` : ''}
        </td>
        <td class="text-mono muted" style="white-space:nowrap">${esc(kzNumberLabel)}</td>
        <td class="muted" style="font-size:0.875rem">${esc(kz.who || '—')}</td>
        <td>${linkedKpiCell(kz, dept)}</td>
        <td>${odgCell}</td>
        <td class="muted tnum" style="white-space:nowrap">${esc(kz.start || '—')}</td>
        <td>
          ${stepDotStrip(kz)}
          <span class="faint tnum" style="font-size:11.5px;margin-left:6px">${p.done}/8</span>
        </td>
        <td>${statusBadge}${stallFlag}</td>
        <td style="text-align:right">${actionCell}</td>
      </tr>`;
  }).join('');

  // candidates already excludes any KPI with an open KZ on file (see
  // aiDraftCandidatesFromRedKpis) — just append them after the real rows.
  const candidateRows = candidates.map(candidateRowHTML).join('');

  return `
    <div class="table-wrap"><div class="table-scroll">
      <table class="dt">
        <thead>
          <tr>
            <th style="min-width:260px">Item</th>
            <th>KZ #</th>
            <th>Who</th>
            <th>Linked red KPI</th>
            <th>ODG</th>
            <th>Start</th>
            <th style="min-width:220px">Progress (1–8)</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>${rows}${candidateRows}</tbody>
      </table>
    </div></div>`;
}

// ─── Tracker header: funnel + counts ─────────────────────────────────────────
// counts[i] = how many KZs in this dept reached step i+1 — a visual drop-off
// curve across the 8 steps (a real cliff between, say, steps 6 and 7 shows up
// as a red bar via svgFunnel's own reach-vs-step-1 RAG grading).

function stepReachCounts(records) {
  return Array.from({ length: 8 }, (_, i) =>
    records.filter(kz => !!(kz.steps && kz.steps[String(i + 1)])).length);
}

function renderTrackerHeaderMeta(records) {
  const counts  = stepReachCounts(records);
  const total   = records.length;
  const open    = records.filter(kz => !kz.closed).length;
  const closed  = records.filter(kz => kz.closed).length;
  const flagged = records.filter(kz => !!stallInfo(kz)).length;
  const svg = svgFunnel(counts, { labels: counts.map((_, i) => `S${i + 1}`), width: 300, height: 108 });

  return `
    <div class="ps-funnel">
      <span class="running-head">Step reach — where KZs drop off</span>
      <div class="ps-funnel__svg">${svg}</div>
      <div class="ps-summary">
        <span class="ps-summary__stat"><b>${total}</b>total</span>
        <span class="ps-summary__stat"><b>${open}</b>open</span>
        <span class="ps-summary__stat"><b>${closed}</b>closed</span>
        <span class="ps-summary__stat${flagged ? ' ps-summary__stat--flag' : ''}"><b>${flagged}</b>flagged</span>
      </div>
    </div>`;
}

// ─── Red SUB-KPI selector ─────────────────────────────────────────────────────
// A 8-step is triggered by a red SUB-KPI (level 2/3), not the main.

function subKpis(dept) {
  if (!dept.kpis) return [];
  return dept.kpis.filter(k => !k.isMain && (k.level === 2 || k.level === 3));
}

function renderRedKpiSelector(dept) {
  const subs = subKpis(dept);
  const redSubs = subs.filter(k => {
    const rag = ragStatus(k.actual, k.target, k.direction || 'higher_better');
    return rag === 'red' || rag === 'amber';
  });

  if (!subs.length) {
    return `<p class="muted" style="margin:0;font-size:0.82rem">No sub-KPIs defined for ${esc(dept.name)} — drill from the KPI board to open an 8-step.</p>`;
  }

  const ragLabel = { green: '● Green', amber: '▲ Amber', red: '● Red', nodata: '— No data' };
  // Prefer red/amber subs; fall back to all subs so the demo always has options.
  const list = redSubs.length ? redSubs : subs;
  const options = list.map(k => {
    const rag = ragStatus(k.actual, k.target, k.direction || 'higher_better');
    return `<option value="${esc(k.id)}">${ragLabel[rag] || rag} — ${esc(k.name)} (${formatVal(k.actual, k.unit)} vs ${formatVal(k.target, k.unit)})</option>`;
  }).join('');

  return `
    <label class="muted" style="font-size:13px" for="ps-kpi-select">Trigger a new 8-step from a red sub-KPI</label>
    <select id="ps-kpi-select" class="input" style="width:auto;min-width:250px">
      <option value="">— Select a red sub-KPI —</option>
      ${options}
    </select>
    <button id="ps-open-btn" class="btn btn--primary" onclick="window._psOpenWizard()">Open 8-Step (AI-Drafted)</button>`;
}

// Pick a prior similar completed KZ in this dept to ground the draft.
function priorSimilarKZ(dept) {
  return _kzRecords.find(k => isCompletedA3(k)) || null;
}

function govSop(dept) {
  // Derive the governing SOP for step-8 write-back from a prior KZ's step8 link
  // (which references the real SOP-library / data/sops entry) when available.
  const prior = priorSimilarKZ(dept);
  if (prior && prior.content && prior.content.step8 && prior.content.step8.sopLink) {
    return prior.content.step8.sopLink;
  }
  return { id: null, title: null };
}

// ─── Chart helpers (Steps 1, 2, 3, 7) ─────────────────────────────────────────
// Real actual-vs-target / breakdown charts drawn from the active KPI's own
// `series` (data/*.json) via lib/charts.js's stepChart/paretoBars (the A3
// gap/recovery + largest-first breakdown spec helpers — §4 of the guide).
// Zero-invented-data rule: anything we have to synthesize — no real series on
// file, or the "did it get back to green" future that hasn't happened yet for
// a still-open KZ — is visibly badged "illustrative", never blended in as if
// it were a real reading.

function cap(s) {
  const str = String(s || '');
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Deterministic small illustrative trend anchored to the KPI's own
// target/actual (no RNG — a given KPI always renders the same illustrative
// shape). Used only when a KPI has no usable real `series` on file.
function synthIllustrativeSeries(target, actual) {
  const t = typeof target === 'number' ? target : 100;
  const a = typeof actual === 'number' ? actual : t * 0.85;
  const span = Math.abs(t - a) || t * 0.05 || 1;
  const start = a - span * 0.35;
  const n = 6;
  return Array.from({ length: n }, (_, i) => {
    const f = i / (n - 1);
    const wobble = (i % 2 === 0 ? -1 : 1) * span * 0.08;
    return +(start + (a - start) * f + wobble).toFixed(4);
  });
}

// Illustrative "what recovery could look like" tail appended after a real
// (or synthesized) baseline. Step 7 asks "did it get back to green?" — for a
// KZ still open in the wizard that answer genuinely isn't measured yet, so
// this is always rendered badged illustrative at the call site. Direction-
// aware: for a lower_better KPI (e.g. DART incidents) the projected path
// must land BELOW target to read green (ragStatus's target/actual ratio),
// not above it — mirroring the higher_better climb-through-amber-into-green
// shape on the other side of the target line.
function synthRecoveryTail(lastVal, target, direction = 'higher_better') {
  if (typeof target !== 'number' || typeof lastVal !== 'number') return [];
  if (target === 0) return [lastVal * 0.5, lastVal * 0.15, 0].map(v => +v.toFixed(4));
  // Climbing/falling toward target, then deliberately through the amber band
  // (ragStatus green needs ratio>=1.0, amber needs ratio>=0.95) before
  // landing solidly in-target — so the projection visibly crosses
  // red→amber→green rather than skipping straight from red to green.
  const step1 = lastVal + (target - lastVal) * 0.5;
  const overshoot = direction === 'lower_better'
    ? [target * 1.035, target * 0.97]   // just above target (amber) → below target (green)
    : [target * 0.965, target * 1.02];  // just below target (amber) → above target (green)
  return [step1, ...overshoot].map(v => +v.toFixed(4));
}

function hasRealSeries(kpi) {
  return !!(kpi && Array.isArray(kpi.series)
    && kpi.series.filter(v => typeof v === 'number' && !Number.isNaN(v)).length >= 2);
}

// ─── A3 chart figures (Steps 1, 2, 3, 7) — lib/charts.js's spec helpers ───────
// `stepChart` (gap + recovery, solid actual vs dashed target, optional
// dashed hollow-dot projected tail + countermeasure-in marker) and
// `paretoBars` (largest-first breakdown) draw the SVG; `chartFig` wraps it in
// the ported `.chart-fig`/`.chart-fig__cap` figure + an `illustrative` badge
// exactly per reference view-solve.js's `chartFig`/`kzGapChart`/
// `kzParetoChart`/`kzRecoveryChart` — grounded here in OUR kpi.series/target/
// direction instead of the reference's hardcoded DATA.kpis.otp.

function chartFig(svg, opts = {}) {
  return `<figure class="chart-fig">
    ${svg}
    <figcaption class="chart-fig__cap">
      ${opts.illustrative ? '<span class="badge badge--outline" style="font-size:10px">illustrative</span>' : ''}
      ${opts.caption ? `<span>${esc(opts.caption)}</span>` : ''}
    </figcaption>
  </figure>`;
}

function noKpiChartFig() {
  return chartFig('<div class="muted" style="font-size:12.5px;padding:12px 0">No KPI selected yet — pick a red sub-KPI to see its trend.</div>', {});
}

// y-axis label formatter honoring the KPI's own unit — stepChart's default
// (`Math.round(v*100)+'%'`) only suits ratio/percent KPIs.
function stepChartFmtY(kpi) {
  const u = kpi && kpi.unit;
  if (u === 'ratio' || u === 'percent' || u === '%' || u === 'pct') return (v) => (v * 100).toFixed(1) + '%';
  return (v) => formatVal(v, u);
}

function chartXLabels(n, extra) {
  const base = Array.from({ length: n }, (_, i) => `P${i + 1}`);
  for (let i = 0; i < (extra || 0); i++) base.push(`P${n + i + 1}*`);
  return base;
}

// Steps 1 & 3 — gap / objective trend: actual vs target from the KPI's own series.
function gapChartFig(kpi) {
  if (!kpi) return noKpiChartFig();
  const real = hasRealSeries(kpi);
  const series = real ? kpi.series.slice() : synthIllustrativeSeries(kpi.target, kpi.actual);
  if (!series.length) return noKpiChartFig();
  const target = typeof kpi.target === 'number' ? kpi.target : undefined;
  const illustrative = !real || !!kpi.illustrative;
  const svg = stepChart(series, {
    target, xLabels: chartXLabels(series.length),
    label: `${kpi.name} actual vs target`, fmtY: stepChartFmtY(kpi),
  });
  const caption = illustrative
    ? `${kpi.name} — no weekly series on file; gap trend shown is illustrative`
    : `${kpi.name} — actual vs target, ${series.length} periods on file`;
  return chartFig(svg, { illustrative, caption });
}

// Step 7 — recovery trend: real baseline + countermeasure-in marker + an
// illustrative projected recovery tail (an open KZ has no real "back to
// green" measurement yet — confirming that is what Step 7 asks the human to
// go do). Direction-correct via synthRecoveryTail(..., kpi.direction).
function recoveryChartFig(kpi) {
  if (!kpi) return noKpiChartFig();
  const real = hasRealSeries(kpi);
  const baseline = real ? kpi.series.slice() : synthIllustrativeSeries(kpi.target, kpi.actual);
  if (!baseline.length) return noKpiChartFig();
  const target = typeof kpi.target === 'number' ? kpi.target : null;
  const direction = kpi.direction || 'higher_better';
  const tail = target != null ? synthRecoveryTail(baseline[baseline.length - 1], target, direction) : [];
  const hasTail = tail.length > 0;
  const svg = stepChart(baseline, {
    target: target != null ? target : undefined,
    projected: hasTail ? tail : undefined,
    xLabels: chartXLabels(baseline.length, tail.length),
    label: `${kpi.name} recovery trend`, fmtY: stepChartFmtY(kpi),
  });
  // Badge illustrative only when the chart actually contains synthesized data:
  // a projected recovery tail, or a fully synthesized baseline (no real series).
  const illustrative = !real || hasTail || !!kpi.illustrative;
  let caption;
  if (!real) {
    caption = `${kpi.name} — no weekly series on file; recovery trend shown is illustrative`;
  } else if (hasTail) {
    caption = `${kpi.name} — periods 1–${baseline.length} actual · marker = countermeasure-in · periods ${baseline.length + 1}–${baseline.length + tail.length} projected recovery (not yet measured)`;
  } else {
    caption = `${kpi.name} — actual vs target, ${baseline.length} periods on file`;
  }
  return chartFig(svg, { illustrative, caption });
}

// Step 2 — breakdown/Pareto: stratify the gap by the KPI's own family
// (siblings sharing a parent = location/rep/team breakdown per the
// registry), largest contributor first.
function paretoRowsFor(dept, kpi) {
  if (!kpi) return { rows: [], illustrative: true };
  let family = [];
  if (kpi.contributors && kpi.contributors.length) {
    family = contributorsOf(dept, kpi.id);
  } else if (kpi.parentId) {
    family = contributorsOf(dept, kpi.parentId);
  }
  if (family.length >= 2) {
    const dir = kpi.direction || 'higher_better';
    const rows = family.map(k => {
      const value = (typeof k.actual === 'number' && typeof k.target === 'number')
        ? Math.max(0, dir === 'higher_better' ? k.target - k.actual : k.actual - k.target)
        : null;
      return { label: k.location ? cap(k.location) : k.name, value };
    });
    return { rows, illustrative: false };
  }
  // No real family on file — a small illustrative stratification, sized off
  // the KPI's own real gap so it's at least proportionate, not made up whole.
  const t = typeof kpi.target === 'number' ? kpi.target : 100;
  const a = typeof kpi.actual === 'number' ? kpi.actual : t * 0.85;
  const totalGap = Math.max(Math.abs(t - a), 0.0001);
  const shares = [0.42, 0.27, 0.19, 0.12];
  const labels = ['Location A', 'Location B', 'Location C', 'Other'];
  return { rows: labels.map((label, i) => ({ label, value: +(totalGap * shares[i]).toFixed(4) })), illustrative: true };
}

// Sort largest-first + drop rows with no computable gap — `paretoBars`
// expects the caller to pre-sort (see lib/charts.js doc comment) and can't
// plot a null value.
function paretoChartFig(dept, kpi) {
  if (!kpi) return '';
  const { rows, illustrative } = paretoRowsFor(dept, kpi);
  const clean = rows.filter((r) => typeof r.value === 'number').sort((a, b) => b.value - a.value);
  if (!clean.length) return '';
  const ratioLike = kpi.unit === 'ratio' || kpi.unit === 'percent' || kpi.unit === '%' || kpi.unit === 'pct';
  const svg = paretoBars(clean, {
    label: `${kpi.name} gap by location, largest contributor first`,
    ...(ratioLike ? {} : { fmt: (v) => formatVal(v, kpi.unit) }),
  });
  const caption = illustrative
    ? `Illustrative breakdown — no location/rep-level sub-KPI family on file for ${kpi.name}.`
    : `Where the gap is coming from — ${kpi.name}'s family, largest contributor first.`;
  return chartFig(svg, { illustrative, caption });
}

// ─── Shared field helpers (steps 1–3, 7, 8 — plain A3 grid fields) ────────────

// A field wrapped in a tinted callout (Step 1's red Gap, Step 2's sage
// Prioritized Problem, Step 4's sage Root Cause) — the callout chrome lives
// on the wrapping div; the textarea itself renders borderless/transparent so
// it reads as "editable text inside the callout" rather than a nested input
// box inside a box.
function calloutTextarea(key, hint, value, rows) {
  return `<textarea class="input" data-field="${key}" rows="${rows || 2}" placeholder="${esc(hint)}"
    style="background:transparent;border:none;padding:0;box-shadow:none;font-weight:500;resize:vertical">${esc(value)}</textarea>`;
}

function attachSlot(label) {
  return `<div class="drop-zone">
    <span>${esc(label || 'Attach an image or chart — floor photos, before/after, source screenshots')}</span>
    <button class="btn btn--ghost btn--sm" type="button">Add Image</button>
  </div>`;
}

function fieldDefsOf(stepDef) {
  return Object.fromEntries((stepDef.fields || []).map((f) => [f.key, f]));
}

// ─── Step 1 — Clarify the Problem ──────────────────────────────────────────────

function renderStep1(stepDef, draft, kpi) {
  const saved = _stepData[1] || {};
  const draftFields = (draft && draft.fields) || {};
  const F = fieldDefsOf(stepDef);
  const val = (k) => (saved[k] != null ? saved[k] : (draftFields[k] || ''));
  const plainField = (key) => `
    <div class="field">
      <span class="field__label">${esc(F[key].label)}</span>
      <textarea class="input" data-field="${key}" rows="2" placeholder="${esc(F[key].hint)}">${esc(val(key))}</textarea>
    </div>`;

  return `
    <div class="a3-grid a3-grid--2">
      ${plainField('ultimateGoal')}
      ${plainField('standard')}
      ${plainField('current')}
      <div class="field">
        <span class="field__label">${esc(F.gap.label)}</span>
        <div class="a3-callout a3-callout--red">${calloutTextarea('gap', F.gap.hint, val('gap'), 2)}</div>
      </div>
    </div>
    <div class="field" style="margin-top:24px"><span class="field__label">Chart — the gap over time</span>${gapChartFig(kpi)}</div>
    ${attachSlot()}`;
}

// ─── Step 2 — Break Down the Problem (stratification + Pareto) ────────────────

function renderStep2(stepDef, draft, dept, kpi) {
  const saved = _stepData[2] || {};
  const draftFields = (draft && draft.fields) || {};
  const F = fieldDefsOf(stepDef);
  const val = (k) => (saved[k] != null ? saved[k] : (draftFields[k] || ''));
  const pareto = paretoChartFig(dept, kpi);

  return `
    <span class="running-head">Stratification — what · where · when · who (not why) · Genchi Genbutsu to the point of occurrence</span>
    <div class="field" style="margin-top:12px">
      <textarea class="input" data-field="stratification" rows="3" placeholder="${esc(F.stratification.hint)}">${esc(val('stratification'))}</textarea>
    </div>
    <div class="field" style="margin-top:20px">
      <span class="field__label">${esc(F.prioritizedProblem.label)}</span>
      <div class="a3-callout a3-callout--accent">${calloutTextarea('prioritizedProblem', F.prioritizedProblem.hint, val('prioritizedProblem'), 2)}</div>
    </div>
    ${pareto ? `<div class="field" style="margin-top:24px"><span class="field__label">Breakdown — Where Is It Coming From?</span>${pareto}</div>` : ''}`;
}

// ─── Step 3 — Target Setting (Objective) ───────────────────────────────────────

function renderStep3(stepDef, draft, kpi) {
  const saved = _stepData[3] || {};
  const draftFields = (draft && draft.fields) || {};
  const F = fieldDefsOf(stepDef);
  const val = (k) => (saved[k] != null ? saved[k] : (draftFields[k] || ''));
  const plainField = (key) => `
    <div class="field">
      <span class="field__label">${esc(F[key].label)}</span>
      <textarea class="input" data-field="${key}" rows="2" placeholder="${esc(F[key].hint)}">${esc(val(key))}</textarea>
    </div>`;

  return `
    <div class="a3-grid a3-grid--3">
      ${plainField('doWhat')}
      ${plainField('toWhat')}
      ${plainField('byWhen')}
    </div>
    <div class="field" style="margin-top:24px"><span class="field__label">Chart — eliminating the prioritized problem inside the big-problem gap</span>${gapChartFig(kpi)}</div>`;
}

// ─── 5-Whys ladder + 6M fishbone (Step 4) ─────────────────────────────────────

function render5Whys6M(stepDef, draft) {
  const saved = _stepData[4] || {};
  const draftWhys = (draft && draft.whys) || [];
  const cats = (_template && _template.fishboneCategories) || ['Man', 'Method', 'Machine', 'Material', 'Environment', 'Measurement'];
  const F = fieldDefsOf(stepDef);

  // 5-Whys ladder — one `.a3-why` row per rung: Why-N label · 6M category chip
  // · editable text on a subtle bg (design-system spec §5.5 step 4), replacing
  // the old two-column ladder+fishbone-table layout.
  const ladder = [1, 2, 3, 4, 5].map((n, i) => {
    const key = `why${n}`;
    const dw = draftWhys.find(w => w.n === n);
    const val = saved[key] != null ? saved[key] : (dw ? dw.text : '');
    const cat = dw ? dw.category : ((F[key] && F[key].fishbone) || cats[i]);
    const hint = (F[key] && F[key].hint) || 'Why did the level above occur? (fact-based, no blame)';
    return `
      <div class="a3-why">
        <span class="field__label" style="white-space:nowrap">Why ${n}</span>
        <span class="chip">${esc(cat)}</span>
        <textarea class="input" data-field="${key}" rows="1" placeholder="${esc(hint)}"
          style="background:transparent;border:none;padding:0;box-shadow:none;resize:vertical">${esc(val)}</textarea>
      </div>`;
  }).join('');

  const rootVal = saved.rootCause != null ? saved.rootCause : (draft ? draft.rootCause : '');

  // Secondary 6M contributing-factor notes — independent of a specific why
  // rung; also the target Mark's per-category "altbranch" step-help
  // suggestions write into (see window._psMarkAdd's 'altbranch' handler).
  const fishboneRows = cats.map(cat => {
    const fk = `fishbone_${cat.toLowerCase()}`;
    const dw = draftWhys.find(w => w.category === cat);
    const val = saved[fk] != null ? saved[fk] : (dw ? dw.text.replace(/\s+←.*$/, '') : '');
    return `
      <tr>
        <td style="font-weight:600;width:110px;color:var(--text-dim)">${esc(cat)}</td>
        <td><input type="text" class="input" data-field="${fk}" placeholder="How does ${esc(cat)} contribute?" value="${esc(val)}"></td>
      </tr>`;
  }).join('');

  return `
    <span class="running-head">5-Whys ladder — Genchi Genbutsu: confirm each at the point of occurrence</span>
    <div class="a3-whys" style="margin-top:12px">${ladder}</div>
    <div class="field" style="margin-top:20px">
      <span class="field__label">Root Cause (confirmed) <span class="chip" style="margin-left:6px">high-leverage</span></span>
      <div class="a3-callout a3-callout--accent">${calloutTextarea('rootCause', F.rootCause.hint, rootVal, 2)}</div>
    </div>
    <div style="margin-top:20px">
      <span class="running-head">Additional 6M factors (optional — not on the 5-Whys ladder)</span>
      <table class="fishbone-tbl" style="margin-top:8px">${fishboneRows}</table>
    </div>`;
}

// ─── Countermeasure scoring matrix (Step 5) ───────────────────────────────────

function renderScoringMatrix(draft) {
  const cols = (_template && _template.scoringMatrix && _template.scoringMatrix.columns) || [
    { key: 'S', label: 'Safety' }, { key: 'Q', label: 'Quality' }, { key: 'C', label: 'Cost' },
    { key: 'T', label: 'Time' }, { key: 'Cu', label: 'Customer' }, { key: 'Ef', label: 'Effective' }, { key: 'OA', label: 'Overall' }
  ];
  const dims = cols.filter((c) => c.key !== 'OA');
  const oaCol = cols.find((c) => c.key === 'OA') || { key: 'OA', label: 'Overall' };
  const saved = (_stepData[5] && _stepData[5].countermeasures) || null;
  const rows = saved || (draft && draft.countermeasures) || [];

  // Dimension columns score 0 (worst) · 1 · 2 (best); Overall (OA) is a bold
  // 1–5 ranked-priority select — not a sum of the dimension scores.
  const scoreCell = (row, ck, i, isOA) => {
    const v = row[ck];
    const options = isOA ? ['', 1, 2, 3, 4, 5] : ['', 0, 1, 2];
    const opts = options.map((o) =>
      `<option value="${o}" ${String(v) === String(o) ? 'selected' : ''}>${o === '' ? '–' : o}</option>`).join('');
    return `<td class="num score-cell"><select class="score-sel ${isOA ? 'score-sel--oa' : ''}" data-cm-field="${ck}" data-cm-row="${i}" aria-label="${esc(ck)} score, row ${i + 1}">${opts}</select></td>`;
  };

  const body = rows.map((row, i) => `
    <tr>
      <td><input type="text" class="input cm-text" data-cm-field="text" data-cm-row="${i}" value="${esc(row.text)}" placeholder="Countermeasure candidate" aria-label="Countermeasure ${i + 1}"></td>
      ${dims.map((c) => scoreCell(row, c.key, i, false)).join('')}
      ${scoreCell(row, oaCol.key, i, true)}
    </tr>`).join('');

  return `
    <span class="running-head">Countermeasure scoring matrix — score each 0 (worst) · 1 · 2 (best) per dimension</span>
    <div class="table-wrap" style="margin-top:12px;box-shadow:none">
      <table class="dt">
        <thead>
          <tr>
            <th style="min-width:260px">Countermeasure</th>
            ${dims.map((c) => `<th class="num" title="${esc(c.label)}">${esc(c.key)}</th>`).join('')}
            <th class="num" title="Overall — ranked priority">${esc(oaCol.key)}</th>
          </tr>
        </thead>
        <tbody id="cm-matrix-body">${body}</tbody>
      </table>
    </div>
    <div style="display:flex;align-items:baseline;justify-content:space-between;gap:16px;margin-top:12px;flex-wrap:wrap">
      <p style="margin:0;font-size:12.5px;color:var(--text-dim);max-width:80ch"><b>Overall</b> is the ranked priority, not a sum. Build consensus first (Nemawashi) — reviewed with cross-functional leads.</p>
      <button class="btn btn--outline btn--sm" onclick="window._psAddCmRow()">Add Countermeasure</button>
    </div>`;
}

// ─── Action register + ODG gate (Step 6) ──────────────────────────────────────

function renderActionRegister(draft) {
  const statusTone = { R: 'red', Y: 'amber', G: 'green', C: 'accent' };
  const statusLabels = { R: 'Behind', Y: 'At Risk', G: 'On Track', C: 'Completed' };

  const savedRows = (_stepData[6] && _stepData[6].actionRows)
    || (draft && draft.actionRows)
    || Array.from({ length: 3 }, (_, i) => ({ no: i + 1, plan: '', startDate: '', dueDate: '', responsible: '', status: 'R' }));

  // Status select is styled with the same tone tokens as `.badge--{tone}` —
  // an at-a-glance R/Y/G/C color signal that stays a live, editable control
  // (the reference's own action register is a static read-only demo; ours is
  // the live wizard, so it can't be a plain badge).
  const statusStyle = (status) => {
    if (status === 'C') return 'color:var(--accent-text);background:hsl(var(--action-1));border-color:hsl(var(--action-3))';
    const tone = statusTone[status];
    return tone ? `color:var(--${tone}-text);background:var(--${tone}-bg);border-color:var(--${tone}-border)` : '';
  };

  const rows = savedRows.map((row, i) => `
    <tr>
      <td class="tnum" style="width:40px">${row.no || i + 1}</td>
      <td><input type="text" class="input" data-ar-field="plan" data-ar-row="${i}" value="${esc(row.plan)}" placeholder="What needs to be done" aria-label="Plan, row ${i + 1}"></td>
      <td><input type="date" class="input" data-ar-field="startDate" data-ar-row="${i}" value="${esc(row.startDate)}" style="min-width:130px" aria-label="Start date, row ${i + 1}"></td>
      <td><input type="date" class="input" data-ar-field="dueDate" data-ar-row="${i}" value="${esc(row.dueDate)}" style="min-width:130px" aria-label="Due date, row ${i + 1}"></td>
      <td><input type="text" class="input" data-ar-field="responsible" data-ar-row="${i}" value="${esc(row.responsible)}" placeholder="Name" style="min-width:110px" aria-label="Responsible, row ${i + 1}"></td>
      <td>
        <select class="input" data-ar-field="status" data-ar-row="${i}" style="min-width:120px;font-weight:600;${statusStyle(row.status)}" aria-label="Status, row ${i + 1}">
          ${Object.keys(statusLabels).map((s) =>
            `<option value="${s}" ${row.status === s ? 'selected' : ''}>${s} — ${statusLabels[s]}</option>`).join('')}
        </select>
      </td>
    </tr>`).join('');

  const gate = (_stepData[6] && _stepData[6].odgGate) || (draft && draft.odgGate) || { status: 'pending', reviewer: 'Eric / Allison (ODG)' };
  const gateStatusBadge = {
    pending:   '<span class="badge badge--neutral">Not yet submitted</span>',
    submitted: '<span class="badge badge--amber"><span class="dot"></span>Submitted — awaiting ODG</span>',
    approved:  '<span class="badge badge--green"><span class="dot"></span>✓ ODG approved</span>',
  }[gate.status] || '';
  const gateBtn = gate.status === 'approved'
    ? ''
    : `<button class="btn btn--secondary btn--sm" onclick="window._psSubmitOdg()">${gate.status === 'submitted' ? 'Mark ODG-Approved' : 'Submit to ODG for gate review'}</button>`;

  return `
    <span class="running-head">Action register — R Behind · Y At Risk · G On Track · C Completed</span>
    <div class="table-wrap" style="margin-top:12px;box-shadow:none">
      <table class="dt">
        <thead>
          <tr><th style="width:40px">No.</th><th style="min-width:220px">Implementation Plan</th><th>Start</th><th>Due</th><th>Responsible</th><th>Status</th></tr>
        </thead>
        <tbody id="action-register-body">${rows}</tbody>
      </table>
    </div>
    <button class="btn btn--ghost btn--sm" style="margin-top:8px" onclick="window._psAddActionRow()">Add Row</button>

    <div class="card card--pad" style="margin-top:16px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;box-shadow:none;background:var(--bg-subtle)">
      <div>
        <h4>ODG Gate — Step 6</h4>
        <p style="margin:4px 0 0;font-size:12.5px;color:var(--text-dim)">Reviewer: ${esc(gate.reviewer)}. The countermeasure plan is reviewed before implementation proceeds.</p>
      </div>
      <div style="display:flex;align-items:center;gap:12px">
        ${gateStatusBadge}
        ${gateBtn}
      </div>
    </div>`;
}

// ─── Results (Step 7) ─────────────────────────────────────────────────────────

function renderResults(stepDef, kpi) {
  const saved = _stepData[7] || {};
  const F = fieldDefsOf(stepDef);
  const seed = {
    kpi: kpi ? kpi.name : '',
    measurementStart: kpi ? `${formatVal(kpi.actual, kpi.unit)} (baseline)` : '',
    newTarget: kpi ? `${formatVal(kpi.target, kpi.unit)}` : ''
  };
  const val = (k) => (saved[k] != null ? saved[k] : (seed[k] || ''));
  const plainField = (key) => `
    <div class="field">
      <span class="field__label">${esc(F[key].label)}</span>
      <input type="text" class="input" data-field="${key}" placeholder="${esc(F[key].hint)}" value="${esc(val(key))}">
    </div>`;

  return `
    <div class="a3-grid a3-grid--2">
      ${plainField('kpi')}
      ${plainField('measurementStart')}
      ${plainField('measurementEnd')}
      ${plainField('newTarget')}
    </div>
    <div class="field" style="margin-top:20px">
      <span class="field__label">${esc(F.narrative.label)}</span>
      <textarea class="input" data-field="narrative" rows="4" placeholder="${esc(F.narrative.hint)}">${esc(val('narrative'))}</textarea>
    </div>
    <div class="field" style="margin-top:24px"><span class="field__label">${esc(F.chart.label)}</span>${recoveryChartFig(kpi)}</div>
    ${attachSlot('Attach the confirmed measurement chart on close — the weekly series is pulled automatically when you confirm')}`;
}

// ─── Standardize + SOP write-back (Step 8) ─────────────────────────────────────

function renderStandardize(stepDef, dept) {
  const saved = _stepData[8] || {};
  const F = fieldDefsOf(stepDef);
  const val = (k) => saved[k] || '';
  const plainField = (key) => `
    <div class="field">
      <span class="field__label">${esc(F[key].label)}</span>
      <textarea class="input" data-field="${key}" rows="2" placeholder="${esc(F[key].hint)}">${esc(val(key))}</textarea>
    </div>`;

  const sop = govSop(dept);
  const sopTitle = sop.title || 'the governing Standard Work';
  const writeBackAction = _sopWrittenBack
    ? `<span class="badge badge--green"><span class="dot"></span>Standard Work updated</span>`
    : `<button class="btn btn--primary btn--sm" onclick="window._psWriteBackSop()">Update Standard Work</button>`;

  return `
    <div class="a3-grid a3-grid--2">
      ${plainField('processDocuments')}
      ${plainField('training')}
      ${plainField('yokoten')}
      ${plainField('improvementImage')}
    </div>
    ${attachSlot('Attach the before/after improvement image — the metric before and after the countermeasure')}
    <div class="card card--pad" style="margin-top:20px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;box-shadow:none;background:hsl(var(--action-1));border-color:hsl(var(--action-3))">
      <div>
        <h4>SOP Write-Back (Yokoten)</h4>
        <p style="margin:4px 0 0;font-size:12.5px;color:var(--text-dim)">${esc(sopTitle)} — SOPs are the input to Steps 1–5 and the output of Step 8. <a href="#/dept/${esc(dept.id)}/sop" style="color:var(--accent-text)">Open Standard Work →</a></p>
      </div>
      ${writeBackAction}
    </div>`;
}

// ─── Wizard step page ─────────────────────────────────────────────────────────

function renderWizardStep(dept, kpi, stepN, template, kz) {
  const stepDef = template.steps[stepN - 1];
  if (!stepDef) return `<div class="eightstep__body" data-step="${stepN}"><p class="muted">Step ${stepN} not found in template.</p></div>`;

  // Build the structured draft for this step (steps 1–6 only).
  const prior = kz._prior || null;
  const sop   = kz._sop || null;
  const draft = AI_STEPS.includes(stepN)
    ? draftStep(dept.id, stepN, {
        kpi: kpi?.name, kpiActual: kpi?.actual ?? null, kpiTarget: kpi?.target ?? null,
        kpiUnit: kpi?.unit, priorKZ: prior, sop
      })
    : null;

  // Step-specific body — real, editable A3 fields per stepBody (design-
  // system spec §5.5), not a generic stand-in card.
  let bodyContent = '';
  if (stepN === 1)      bodyContent = renderStep1(stepDef, draft, kpi);
  else if (stepN === 2) bodyContent = renderStep2(stepDef, draft, dept, kpi);
  else if (stepN === 3) bodyContent = renderStep3(stepDef, draft, kpi);
  else if (stepN === 4) bodyContent = render5Whys6M(stepDef, draft);
  else if (stepN === 5) bodyContent = renderScoringMatrix(draft);
  else if (stepN === 6) bodyContent = renderActionRegister(draft);
  else if (stepN === 7) bodyContent = renderResults(stepDef, kpi);
  else                  bodyContent = renderStandardize(stepDef, dept);

  // Grounded provenance — right-aligned inside the step head, only on the
  // steps the agent actually pre-solves. Replaces the old per-step
  // "AI draft — review & edit" banner box (that info now lives in the
  // `.kz-meta` row once, plus this one-line citation per step).
  const sourceNote = AI_STEPS.includes(stepN) ? stepSourceNote(kpi, prior, sop, kz.kzNumber) : '';

  const prevBtn = `<button class="btn btn--ghost" onclick="window._psGotoStep(${stepN - 1})" ${stepN === 1 ? 'disabled' : ''}>Previous</button>`;
  const nextBtn = stepN < 8
    ? `<button class="btn btn--primary" onclick="window._psConfirmStep(${stepN})">Confirm &amp; Next</button>`
    : `<button class="btn btn--primary" onclick="window._psConfirmStep(${stepN})">Confirm Step 8 — Close KZ</button>`;

  return `
    <div class="eightstep__body" data-step="${stepN}" style="padding:32px 40px">
      <div style="display:flex;align-items:baseline;justify-content:space-between;gap:16px;flex-wrap:wrap">
        <div>
          <span class="running-head">${esc(stepDef.pdca)} · Step ${stepN} of 8${stepDef.highLeverage ? ' · highest-leverage' : ''}</span>
          <h2 style="margin-top:6px;font-size:20px">Step ${stepN}: ${esc(stepDef.name)}</h2>
        </div>
        ${sourceNote ? `<span class="source-note" style="max-width:44ch;text-align:right">${sourceNote}</span>` : ''}
      </div>
      <p style="margin:8px 0 24px;font-size:13px;color:var(--text-dim);max-width:90ch">${esc(stepDef.description)}</p>

      ${bodyContent}

      <div style="display:flex;justify-content:space-between;margin-top:40px">
        ${prevBtn}
        ${nextBtn}
      </div>
    </div>`;
}

// ─── Docked Mark co-pilot (proactive, per-step) ───────────────────────────────
// Sits beside the wizard (never shown in the tracker or read-only A3). Refreshes
// with a scripted, KPI-grounded suggestion every time the step changes
// (_psGotoStep / _psConfirmStep both re-render the whole wizard view). Each idea
// offers an "Add" action that writes straight into the wizard's own DOM fields —
// no separate state model, no network. See lib/agent.js stepHelpFor() for the
// content; this file only renders it and wires the Add/Dismiss/Ask actions.

function renderMarkItem(it, i) {
  let bodyHtml;
  if (it.type === 'chain') {
    bodyHtml = `
      <div class="mark-item__chain">
        ${it.whys.map(w => `<div class="mark-item__why"><b>Why ${w.n}</b><span class="mark-item__cat">${esc(w.category)}</span>${esc(w.text)}</div>`).join('')}
        ${it.rootCause ? `<div class="mark-item__root">Root (hypothesis): ${esc(it.rootCause)}</div>` : ''}
      </div>`;
  } else if (it.type === 'altbranch') {
    bodyHtml = `<div class="mark-item__text"><span class="mark-item__tag">${esc(it.category)}</span>${esc(it.text)}</div>`;
  } else if (it.type === 'countermeasure') {
    bodyHtml = `
      <div class="mark-item__text">${esc(it.text)}</div>
      <div class="mark-item__scores">S${esc(it.S)} · Q${esc(it.Q)} · C${esc(it.C)} · T${esc(it.T)} · Cu${esc(it.Cu)} · Ef${esc(it.Ef)} · OA ${esc(it.OA)}</div>`;
  } else {
    bodyHtml = `<div class="mark-item__text">${esc(it.text)}</div>`;
  }

  return `
    <div class="mark-item" id="mark-item-${i}">
      ${bodyHtml}
      <div class="mark-item__actions">
        <button class="mark-item__btn mark-item__btn--add" onclick="window._psMarkAdd(${i})">${esc(it.label || 'Add')}</button>
        <button class="mark-item__btn mark-item__btn--skip" onclick="window._psMarkSkip(${i})">Dismiss</button>
      </div>
    </div>`;
}

// Docked in the wizard canvas's right column (`.eightstep__assist`, ported
// from reference/view-solve.js's `assistPanel()`): header, per-step note
// card, our own proactive suggestion items (Add/Dismiss — a real feature the
// static reference doesn't have), a running Q&A thread, and the "Ask Mark
// about this step" composer. Always visible (no collapse pill) — the grid
// itself hides the column under 1100px (`.eightstep-wide` media query).
function renderAssistPanel(stepN, stepHelp) {
  const items = (stepHelp && stepHelp.items) || [];
  const itemsHtml = items.length ? items.map((it, i) => renderMarkItem(it, i)).join('') : '';
  const headline = stepHelp && stepHelp.headline;
  const note = stepHelp && stepHelp.note;

  return `
    <aside class="eightstep__assist">
      <div class="assist-head">
        <span class="ai-note__avatar" style="width:28px;height:28px;font-size:12px">M</span>
        <div>
          <b style="font-size:13px">Mark · AI assist</b>
          <div class="faint" style="font-size:11px">Grounded in the red KPI, the SOP, and prior KZs</div>
        </div>
      </div>
      <div class="assist-note">
        <span class="running-head" style="font-size:10px">Step ${stepN}</span>
        ${headline ? `<p style="margin:6px 0 0;font-size:12.5px;font-weight:600;color:var(--text)">${esc(headline)}</p>` : ''}
        ${note ? `<p style="margin:${headline ? '4px' : '6px'} 0 0;font-size:12.5px;line-height:1.55;color:var(--text-secondary)">${esc(note)}</p>` : ''}
        ${!headline && !note ? `<p style="margin:6px 0 0;font-size:12.5px;color:var(--text-faint)">Nothing scripted for this step yet — ask below.</p>` : ''}
      </div>
      ${itemsHtml ? `<div class="assist-items">${itemsHtml}</div>` : ''}
      <div class="assist-thread" id="mark-dock-answers"></div>
      <div class="chat__composer" style="margin-top:auto">
        <textarea class="input" rows="2" id="mark-dock-input" placeholder="Ask Mark about this step"
          aria-label="Ask Mark about this step"
          onkeydown="if(event.key==='Enter'&amp;&amp;!event.shiftKey){event.preventDefault();window._psMarkAsk();}"></textarea>
        <button class="btn btn--primary btn--sm" style="align-self:flex-end" onclick="window._psMarkAsk()">Send</button>
      </div>
    </aside>`;
}

// ─── Read-view: full completed A3 ─────────────────────────────────────────────

function scoreBadge(v) {
  if (v == null) return '<span class="sc sc--na">–</span>';
  return `<span class="sc sc--${v}">${v}</span>`;
}

function renderReadA3(kz, dept, template) {
  const c = kz.content || {};
  const h = c.header || {};
  const cats = (template && template.scoringMatrix && template.scoringMatrix.columns) || [];

  const whysHtml = (c.step4 && c.step4.whys || []).map(w => `
    <div class="ro-why">
      <span class="ro-why__n">Why ${w.n}</span>
      <span class="ro-why__cat">${esc(w.category)}</span>
      <span class="ro-why__t">${esc(w.text)}</span>
    </div>`).join('');

  const altChains = (c.step4 && c.step4.altChains || []).map(ch => `
    <div class="ro-altchain">
      <div class="text-muted" style="font-size:0.72rem;font-weight:700">${esc(ch.label)}</div>
      ${ch.whys.map((t, i) => `<div class="ro-alt-why">Why ${i + 1}: ${esc(t)}</div>`).join('')}
      <div class="ro-alt-root">Root: ${esc(ch.rootCause)}</div>
    </div>`).join('');

  const cmRows = (c.step5 && c.step5.countermeasures || []).map(cm => `
    <tr>
      <td class="cm-text">${esc(cm.text)}</td>
      ${cats.map(col => `<td class="score-cell">${scoreBadge(cm[col.key])}</td>`).join('')}
    </tr>`).join('');

  const arRows = (c.step6 && c.step6.actionRows || []).map(r => `
    <tr>
      <td class="text-center text-mono">${r.no}</td>
      <td>${esc(r.plan)}</td>
      <td class="text-muted">${esc(r.startDate)}</td>
      <td class="text-muted">${esc(r.dueDate)}</td>
      <td>${esc(r.responsible)}</td>
      <td><span class="ar-status ar-status--${r.status}">${esc(r.status)}</span></td>
    </tr>`).join('');

  const gate = (c.step6 && c.step6.odgGate) || {};
  const gateBadge = gate.status === 'approved'
    ? '<span class="gate-badge gate-badge--approved">✓ ODG approved</span>'
    : gate.status === 'pending'
      ? '<span class="gate-badge gate-badge--pending">ODG gate pending</span>' : '';

  const sopLink = (c.step8 && c.step8.sopLink) || {};
  const stepCard = (n, pdca, title, inner) => `
    <div class="ro-step">
      <div class="ro-step__head">
        <span class="pdca-badge">${pdca}</span>
        <span class="ro-step__n">Step ${n}</span>
        <span class="ro-step__title">${esc(title)}</span>
      </div>
      <div class="ro-step__body">${inner}</div>
    </div>`;

  const kv = (label, val) => `<div class="ro-kv"><span class="ro-kv__k">${esc(label)}</span><span class="ro-kv__v">${esc(val)}</span></div>`;

  return `
    <div class="ro-a3">
      <div style="margin-bottom:14px">
        <button class="btn btn--outline" onclick="window._psCloseRead()" style="font-size:0.8rem">← Back to tracker</button>
      </div>

      <div class="ro-header">
        <div>
          <div class="ro-header__title">${esc(kz.title)} <span class="a3-tag">A3</span></div>
          <div class="text-mono text-muted" style="font-size:0.8rem">${esc(kz.kzNumber)} · ${esc(dept.name)}${h.lang ? ' · ' + esc(h.lang) : ''}</div>
        </div>
        <div class="ro-header__meta">
          ${kv('Sponsor', h.sponsor || '—')}
          ${kv('Leader', h.leader || '—')}
          ${kv('Team', h.team || '—')}
          ${kv('Rev Date', h.revDate || '—')}
        </div>
      </div>
      <div style="margin:12px 0 18px">${stepDotStrip(kz)}</div>

      ${stepCard(1, 'PLAN', 'Clarify the Problem', `
        ${kv('Ultimate Goal', c.step1?.ultimateGoal)}
        ${kv('Standard', c.step1?.standard)}
        ${kv('Current Situation', c.step1?.current)}
        <div class="a3-callout a3-callout--red ro-gap">Gap = Problem: <b>${esc(c.step1?.gap)}</b></div>`)}

      ${stepCard(2, 'PLAN', 'Break Down the Problem', `
        ${c.step2?.note ? `<p class="text-muted" style="font-size:0.8rem;margin:0 0 6px">${esc(c.step2.note)}</p>` : ''}
        <div class="a3-callout a3-callout--red ro-prio">Prioritized problem: <b>${esc(c.step2?.prioritizedProblem)}</b></div>`)}

      ${stepCard(3, 'PLAN', 'Objective', `
        ${kv('Do What', c.step3?.doWhat)}
        ${kv('To What', c.step3?.toWhat)}
        ${kv('By When', c.step3?.byWhen)}`)}

      ${stepCard(4, 'PLAN', 'Root Cause (5-Whys + 6M)', `
        <div class="ro-whys">${whysHtml}</div>
        <div class="a3-callout a3-callout--accent ro-rootcause">Root Cause: <b>${esc(c.step4?.rootCause)}</b></div>
        ${altChains ? `<div class="ro-altchains"><div class="text-muted" style="font-size:0.72rem;margin:8px 0 4px">Additional 5-Why chains iterated by the team:</div>${altChains}</div>` : ''}`)}

      ${stepCard(5, 'PLAN', 'Countermeasures (scored)', `
        <div style="overflow-x:auto"><table class="kpi-table cm-matrix">
          <thead><tr><th style="min-width:220px">Countermeasure</th>${cats.map(col => `<th class="score-th" title="${esc(col.label)}">${esc(col.label).slice(0, 4)}</th>`).join('')}</tr></thead>
          <tbody>${cmRows}</tbody>
        </table></div>`)}

      ${stepCard(6, 'DO', 'Implementation + ODG Gate', `
        <div style="overflow-x:auto"><table class="kpi-table" style="font-size:0.83rem">
          <thead><tr><th>No.</th><th>Plan</th><th>Start</th><th>Due</th><th>Responsible</th><th>Status</th></tr></thead>
          <tbody>${arRows}</tbody>
        </table></div>
        <div class="ro-gate">ODG gate: ${gateBadge} <span class="text-muted" style="font-size:0.78rem">${esc(gate.note || '')}</span></div>`)}

      ${stepCard(7, 'CHECK', 'Results', `
        ${kv('KPI', c.step7?.kpi)}
        ${kv('Start (baseline)', c.step7?.measurementStart)}
        ${kv('End (result)', c.step7?.measurementEnd)}
        ${kv('New Target', c.step7?.newTarget)}
        ${c.step7?.narrative ? `<div class="ro-narr">${esc(c.step7.narrative)}</div>` : ''}`)}

      ${stepCard(8, 'ACT', 'Standardize + Yokoten', `
        ${kv('Process Documents', c.step8?.processDocuments)}
        ${kv('Training', c.step8?.training)}
        ${kv('Yokoten', c.step8?.yokoten)}
        <div class="sop-writeback" style="margin-top:12px">
          <div class="sop-writeback__label">SOP Write-Back</div>
          <div style="font-weight:600;font-size:0.9rem">${esc(sopLink.title || '—')}</div>
          <div class="text-muted" style="font-size:0.8rem;margin-top:2px">
            ${sopLink.writtenBack ? '✓ Standard work updated & written back to the SOP library (Yokoten complete).' : 'Standard-work write-back pending close.'}
          </div>
          <a href="#/dept/${esc(dept.id)}/sop" style="display:inline-block;margin-top:8px;font-size:0.85rem;color:var(--accent)">Open Standard Work view →</a>
        </div>`)}
    </div>`;
}

// ─── Main render ──────────────────────────────────────────────────────────────

async function doRender() {
  if (!_dept || !_mount) return;

  if (!_kzRecords.length) {
    try {
      const res = await fetch('data/kz-records.json');
      const all = await res.json();
      _kzRecords = byDept(all, _dept.id);
    } catch (e) { console.warn('Could not load kz-records.json', e); }
  }
  if (!_template) {
    try {
      const res = await fetch('data/eightstep-template.json');
      _template = await res.json();
    } catch (e) { console.warn('Could not load eightstep-template.json', e); }
  }

  let content;

  if (_readKZ) {
    // ── Read-view of a completed A3 ─────────────────────────────────────────
    content = renderReadA3(_readKZ, _dept, _template || { steps: [], scoringMatrix: {} });
  } else if (!_activeKZ) {
    // ── Tracker view ─────────────────────────────────────────────────────────
    const openItems   = _kzRecords.filter(k => !k.closed).length;
    const closedItems = _kzRecords.filter(k => k.closed).length;
    const a3Count     = _kzRecords.filter(isCompletedA3).length;
    const aiDraftKz   = resolveAiDraftKz(_dept, _kzRecords);
    // Honest red-sub-KPI gap count — separate from the _kzRecords-only totals
    // above (owner ask: reflect the red sub-KPIs that have no 8-step yet,
    // even for a dept like Service with zero persisted KZ records on file).
    const aiDraftCandidates = aiDraftCandidatesFromRedKpis(_dept, _kzRecords);
    const redGaps = aiDraftCandidates.length;
    const redGapsNote = redGaps
      ? ` · ${redGaps} red sub-KPI${redGaps === 1 ? '' : 's'} ready for an 8-step`
      : '';

    content = `
      <div class="page-head">
        <div>
          <span class="running-head page-head__eyebrow">${esc(_dept.name)} · 8-Step</span>
          <h1>Problem-Solving Tracker</h1>
          <p class="page-head__sub">${_kzRecords.length} total · ${openItems} open · ${closedItems} closed · ${a3Count} full A3${a3Count === 1 ? '' : 's'}${redGapsNote} — ${esc(_dept.name)}</p>
        </div>
        <div class="page-head__side">
          ${renderRedKpiSelector(_dept)}
        </div>
      </div>

      ${_kzRecords.length ? `<section class="card card--pad">${renderTrackerHeaderMeta(_kzRecords)}</section>` : ''}

      ${aiDraftKz
        ? renderAiDraftBanner(_dept, aiDraftKz)
        : (aiDraftCandidates.length ? renderAiDraftCandidateBanner(_dept, aiDraftCandidates[0]) : '')}

      ${renderTrackerTable(_kzRecords, _dept, aiDraftKz, aiDraftCandidates)}

      <section class="card card--pad" style="margin-top:24px">
        <span class="running-head">How the 8-step is triggered</span>
        <p style="margin:12px 0 0;font-size:13.5px;line-height:1.6;color:var(--text-secondary);max-width:90ch">
          A main KPI turning red is drilled to its contributing sub-KPIs; a red <b>sub-KPI</b> opens an 8-step owned by the
          manager at that level. The agent pre-solves the planning steps (1–6) into a reviewable draft — grounded in the red
          KPI, the governing SOP, and a prior similar KZ — and the human reviews &amp; finishes. Rows tagged
          <span class="badge badge--accent" style="font-size:9.5px">A3</span> carry full completed content from the FMDS-New
          discovery.
        </p>
      </section>

      <p class="board-hint">Extracted from the 8-Step Problem Solving Tracker workbook (Jul 2026). ${esc(_dept.name)} has ${_kzRecords.length} row${_kzRecords.length === 1 ? '' : 's'} on file — ${openItems} open, ${closedItems} closed.</p>`;
  } else {
    // ── Wizard view ───────────────────────────────────────────────────────────
    const kpiId = _activeKZ._kpiId;
    const kpi   = kpiId && _dept.kpis ? _dept.kpis.find(k => k.id === kpiId) : null;
    const tmpl  = _template || { steps: [] };

    // Docked Mark co-pilot: a fresh, proactive suggestion every time the step
    // (re)renders — grounded in the KPI via lib/agent.js, no network.
    _markStepHelp = await liveReply(_dept.id, 'step-help', {
      dept: _dept, step: _currentStep, kpi,
      kpiActual: kpi ? kpi.actual : null, kpiTarget: kpi ? kpi.target : null, kpiUnit: kpi ? kpi.unit : null,
      kz: _activeKZ
    });

    // Wizard header — eyebrow + h1 + the `.kz-meta` row (owner · golden
    // thread · AI-draft badge). No banner box: that info lives only in this
    // row plus the right-aligned source-note inside the step (design-system
    // spec §5.5).
    const kzTitle = esc(_activeKZ.title || _activeKZ.item || _activeKZ.kzNumber);
    const eyebrow = (_template && _template.source) ? _template.source : _dept.name;

    content = `
      <div class="page-head" style="margin-bottom:16px">
        <div>
          <span class="running-head page-head__eyebrow">8-Step Problem Solving A3 · ${esc(eyebrow)}</span>
          <h1>${_activeKZ.kzNumber ? esc(_activeKZ.kzNumber) + ' · ' : ''}${kzTitle}</h1>
          ${renderKzMeta(_dept, _activeKZ, kpi)}
        </div>
        <div class="page-head__side">
          <button class="btn btn--secondary" onclick="window._psCloseWizard()">Back to Tracker</button>
        </div>
      </div>

      <nav class="step-bar" aria-label="8-step progress">${renderStepBar(tmpl, _activeKZ, _currentStep)}</nav>

      <section class="card eightstep-wide">
        ${renderWizardStep(_dept, kpi, _currentStep, tmpl, _activeKZ)}
        ${renderAssistPanel(_currentStep, _markStepHelp)}
      </section>`;
  }

  const viewClass = _activeKZ ? 'ps-view ps-view--wizard' : 'ps-view';
  _mount.innerHTML = `<div class="${viewClass}">${content}</div>`;
  attachHandlers();
}

// ─── Event handlers ───────────────────────────────────────────────────────────

function attachHandlers() {
  // Tracker: AI-draft banner + AI-draft row's "Open 8-Step" button — the SAME
  // `?kpi=<id>&kz=<kzNumber>` hash handoff views/overview.js's "Review Draft
  // 8-Step" note already uses, so the exported entry point's real-KZ lookup
  // (below) resolves the actual record and lands on its first open step.
  _mount.querySelectorAll('[data-go-kz]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const kzNumber = btn.dataset.goKz;
      const kpiId = btn.dataset.goKpi || '';
      location.hash = `#/dept/${_dept.id}/solve?kpi=${encodeURIComponent(kpiId)}&kz=${encodeURIComponent(kzNumber)}`;
    });
  });

  // Not-yet-started AI-draft candidate rows/banner (aiDraftCandidatesFromRedKpis)
  // — no KZ record exists yet, so there's nothing to hash-link to; open the
  // SAME in-memory wizard the sidebar red-KPI <select> already uses, just
  // pre-seeded with this row's real kpiId. Works whether the attribute sits
  // on the whole <tr> (candidateRowHTML) or a standalone button
  // (renderAiDraftCandidateBanner) — a click on the row's inner button
  // bubbles up to the row's own listener, so each element only needs one.
  _mount.querySelectorAll('[data-open-ai-draft]').forEach((el) => {
    el.addEventListener('click', () => {
      window._psOpenWizard(el.dataset.openAiDraft);
    });
  });

  // Step 6 action register — recolor the status <select> live (R/Y/G/C tone
  // tokens matching `.badge--{tone}`) on change, without a full doRender()
  // (which would lose focus/in-progress edits elsewhere in the row). Event
  // delegation on the tbody so it also covers rows added later by
  // _psAddActionRow/_addSuggestedActionRow.
  const arBody = _mount.querySelector('#action-register-body');
  if (arBody) {
    arBody.addEventListener('change', (e) => {
      const sel = e.target.closest('select[data-ar-field="status"]');
      if (!sel) return;
      if (sel.value === 'C') {
        sel.style.cssText += 'color:var(--accent-text);background:hsl(var(--action-1));border-color:hsl(var(--action-3))';
        return;
      }
      const tone = { R: 'red', Y: 'amber', G: 'green' }[sel.value];
      if (tone) sel.style.cssText += `color:var(--${tone}-text);background:var(--${tone}-bg);border-color:var(--${tone}-border)`;
    });
  }

  // presetKpiId lets a candidate row / banner button (data-open-ai-draft)
  // open the wizard directly for a specific KPI, bypassing the <select> —
  // the sidebar "Open 8-Step (AI-Drafted)" button still calls this with no
  // argument, falling back to whatever's selected there, so both entry
  // points share this one code path.
  window._psOpenWizard = (presetKpiId) => {
    const sel = document.getElementById('ps-kpi-select');
    const kpiId = presetKpiId || (sel && sel.value);
    if (!kpiId) { alert('Please select a red sub-KPI first.'); return; }
    const kpi = _dept.kpis ? _dept.kpis.find(k => k.id === kpiId) : null;
    _activeKZ = newKZ({ item: kpi?.name || 'Problem', who: _dept.lead || '', deptId: _dept.id });
    _activeKZ._kpiId = kpiId;
    _activeKZ._prior = priorSimilarKZ(_dept);
    _activeKZ._sop   = govSop(_dept);
    _currentStep = 1;
    _stepData = {};
    _sopWrittenBack = false;
    doRender();
  };

  window._psOpenRead = (idx) => {
    _readKZ = _kzRecords[idx] || null;
    doRender();
  };
  window._psCloseRead = () => { _readKZ = null; doRender(); };

  window._psCloseWizard = () => {
    _activeKZ = null; _currentStep = 1; _stepData = {}; _sopWrittenBack = false; _markStepHelp = null;
    doRender();
  };

  window._psGotoStep = (n) => { _saveCurrentStepInputs(); _currentStep = n; doRender(); };

  window._psConfirmStep = (n) => {
    _saveCurrentStepInputs();
    if (_activeKZ) _activeKZ.steps[String(n)] = true;
    if (n === 8) {
      if (_activeKZ) { _activeKZ.closed = true; _activeKZ.active = false; }
      // _activeKZ is usually a brand-new record (from newKZ(), via the
      // red-sub-KPI selector or the ?kpi= handoff) that isn't in _kzRecords
      // yet — prepend it. But Fix 1's ?kz= handoff can open the wizard on an
      // EXISTING record already IN _kzRecords (same reference); guard so
      // closing that one doesn't duplicate its row in the tracker.
      _kzRecords = _kzRecords.includes(_activeKZ) ? _kzRecords : [_activeKZ, ..._kzRecords];
      _activeKZ = null; _currentStep = 1; _stepData = {}; _sopWrittenBack = false; _markStepHelp = null;
    } else {
      _currentStep = n + 1;
    }
    doRender();
  };

  window._psSubmitOdg = () => {
    _saveCurrentStepInputs();
    const cur = (_stepData[6] && _stepData[6].odgGate) || { status: 'pending', reviewer: 'Eric / Allison (ODG)' };
    const next = cur.status === 'pending' ? 'submitted' : 'approved';
    _stepData[6] = { ...(_stepData[6] || {}), odgGate: { ...cur, status: next } };
    doRender();
  };

  window._psWriteBackSop = () => {
    _saveCurrentStepInputs();
    _sopWrittenBack = true;
    doRender();
  };

  window._psAddActionRow = () => {
    const tbody = document.getElementById('action-register-body');
    if (!tbody) return;
    const n = tbody.querySelectorAll('tr').length + 1;
    if (n > 10) return;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="tnum" style="width:40px">${n}</td>
      <td><input type="text" class="input" data-ar-field="plan" data-ar-row="${n - 1}" placeholder="What needs to be done" aria-label="Plan, row ${n}"></td>
      <td><input type="date" class="input" data-ar-field="startDate" data-ar-row="${n - 1}" style="min-width:130px" aria-label="Start date, row ${n}"></td>
      <td><input type="date" class="input" data-ar-field="dueDate" data-ar-row="${n - 1}" style="min-width:130px" aria-label="Due date, row ${n}"></td>
      <td><input type="text" class="input" data-ar-field="responsible" data-ar-row="${n - 1}" placeholder="Name" style="min-width:110px" aria-label="Responsible, row ${n}"></td>
      <td><select class="input" data-ar-field="status" data-ar-row="${n - 1}" style="min-width:120px;font-weight:600;color:var(--red-text);background:var(--red-bg);border-color:var(--red-border)" aria-label="Status, row ${n}">
        <option value="R" selected>R — Behind</option><option value="Y">Y — At Risk</option>
        <option value="G">G — On Track</option><option value="C">C — Completed</option></select></td>`;
    tbody.appendChild(tr);
  };

  window._psAddCmRow = () => {
    const tbody = document.getElementById('cm-matrix-body');
    if (!tbody) return;
    const i = tbody.querySelectorAll('tr').length;
    const cols = (_template && _template.scoringMatrix && _template.scoringMatrix.columns) || [];
    const dims = cols.filter((c) => c.key !== 'OA');
    const tr = document.createElement('tr');
    const scoreCells = dims.map((c) =>
      `<td class="num score-cell"><select class="score-sel" data-cm-field="${c.key}" data-cm-row="${i}" aria-label="${esc(c.key)} score, row ${i + 1}"><option value="">–</option><option value="0">0</option><option value="1">1</option><option value="2">2</option></select></td>`).join('');
    const oaCell = `<td class="num score-cell"><select class="score-sel score-sel--oa" data-cm-field="OA" data-cm-row="${i}" aria-label="Overall rank, row ${i + 1}"><option value="">–</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></td>`;
    tr.innerHTML = `<td><input type="text" class="input cm-text" data-cm-field="text" data-cm-row="${i}" placeholder="Countermeasure candidate" aria-label="Countermeasure ${i + 1}"></td>${scoreCells}${oaCell}`;
    tbody.appendChild(tr);
    const newInput = tr.querySelector('.cm-text');
    if (newInput) newInput.focus();
  };

  // ── Docked Mark co-pilot ────────────────────────────────────────────────
  window._psMarkAdd = (idx) => {
    if (!_markStepHelp || !_markStepHelp.items || !_markStepHelp.items[idx]) return;
    const item = _markStepHelp.items[idx];
    const panel = document.querySelector('.eightstep__body');
    if (!panel) return;

    if (item.type === 'chain') {
      item.whys.forEach(w => {
        const el = panel.querySelector(`[data-field="why${w.n}"]`);
        if (el) el.value = el.value ? `${el.value}\n\n${w.text}` : w.text;
      });
      if (item.rootCause) {
        const rc = panel.querySelector('[data-field="rootCause"]');
        if (rc) rc.value = rc.value ? `${rc.value}\n\n${item.rootCause}` : item.rootCause;
      }
    } else if (item.type === 'altbranch') {
      const el = panel.querySelector(`[data-field="fishbone_${item.category.toLowerCase()}"]`);
      if (el) el.value = el.value ? `${el.value}\n\n${item.text}` : item.text;
    } else if (item.type === 'countermeasure') {
      _addSuggestedCmRow(item);
    } else if (item.type === 'recovery') {
      const el = panel.querySelector('[data-field="narrative"]');
      if (el) el.value = el.value ? `${el.value}\n\n${item.text}` : item.text;
    } else if (item.type === 'action') {
      _addSuggestedActionRow(item);
    } else if (item.type === 'nudge' && item.field) {
      const el = panel.querySelector(`[data-field="${item.field}"]`);
      if (el) el.value = el.value ? `${el.value}\n\n${item.text}` : item.text;
    }

    _markMarkItem(idx, 'added', '✓ Added — edit above before confirming');
  };

  window._psMarkSkip = (idx) => {
    _markMarkItem(idx, 'skipped', null);
  };

  window._psMarkAsk = async () => {
    const input = document.getElementById('mark-dock-input');
    const q = input && input.value.trim();
    if (!q || !_activeKZ) return;
    const kpiId = _activeKZ._kpiId;
    const kpi = kpiId && _dept.kpis ? _dept.kpis.find(k => k.id === kpiId) : null;
    const reply = await liveReply(_dept.id, 'step-help', { dept: _dept, step: _currentStep, kpi, kz: _activeKZ, question: q });
    const list = document.getElementById('mark-dock-answers');
    const answerText = (reply && reply.items && reply.items[0] && reply.items[0].text) || '';
    if (list) {
      const div = document.createElement('div');
      div.className = 'mark-answer';
      div.innerHTML = `<div class="mark-answer__q">${esc(q)}</div><div class="mark-answer__a">${esc(answerText)}</div>`;
      list.appendChild(div);
    }
    input.value = '';
  };
}

// Visually marks a docked-panel suggestion as handled (added/skipped) in place —
// deliberately NOT a full doRender(), so unsaved edits elsewhere in the wizard
// (and other suggestion rows) are left untouched.
function _markMarkItem(idx, state, doneLabel) {
  const row = document.getElementById(`mark-item-${idx}`);
  if (!row) return;
  row.classList.add(`mark-item--${state}`);
  row.querySelectorAll('button').forEach(b => { b.disabled = true; });
  if (doneLabel) {
    const tag = document.createElement('div');
    tag.className = 'mark-item__done';
    tag.textContent = doneLabel;
    row.appendChild(tag);
  }
}

// Appends one prefilled row to the Step 5 scoring matrix (mirrors _psAddCmRow,
// but seeded with the suggestion's text + scores instead of a blank row).
function _addSuggestedCmRow(item) {
  const tbody = document.getElementById('cm-matrix-body');
  if (!tbody) return;
  const i = tbody.querySelectorAll('tr').length;
  const cols = (_template && _template.scoringMatrix && _template.scoringMatrix.columns) || [];
  const dims = cols.filter((c) => c.key !== 'OA');
  const scoreCell = (ck, isOA) => {
    const v = item[ck];
    const options = isOA ? ['', 1, 2, 3, 4, 5] : ['', 0, 1, 2];
    const opts = options.map((o) =>
      `<option value="${o}" ${String(v) === String(o) ? 'selected' : ''}>${o === '' ? '–' : o}</option>`).join('');
    return `<td class="num score-cell"><select class="score-sel ${isOA ? 'score-sel--oa' : ''}" data-cm-field="${ck}" data-cm-row="${i}" aria-label="${esc(ck)} score, row ${i + 1}">${opts}</select></td>`;
  };
  const scoreCells = dims.map((c) => scoreCell(c.key, false)).join('') + scoreCell('OA', true);
  const tr = document.createElement('tr');
  tr.innerHTML = `<td><input type="text" class="input cm-text" data-cm-field="text" data-cm-row="${i}" value="${esc(item.text)}" placeholder="Countermeasure candidate" aria-label="Countermeasure ${i + 1}"></td>${scoreCells}`;
  tbody.appendChild(tr);
}

// Appends one prefilled row to the Step 6 action register (mirrors _psAddActionRow,
// but seeded with the suggestion's text as the plan).
function _addSuggestedActionRow(item) {
  const tbody = document.getElementById('action-register-body');
  if (!tbody) return;
  const n = tbody.querySelectorAll('tr').length + 1;
  if (n > 10) return;
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td class="tnum" style="width:40px">${n}</td>
    <td><input type="text" class="input" data-ar-field="plan" data-ar-row="${n - 1}" value="${esc(item.text)}" placeholder="What needs to be done" aria-label="Plan, row ${n}"></td>
    <td><input type="date" class="input" data-ar-field="startDate" data-ar-row="${n - 1}" style="min-width:130px" aria-label="Start date, row ${n}"></td>
    <td><input type="date" class="input" data-ar-field="dueDate" data-ar-row="${n - 1}" style="min-width:130px" aria-label="Due date, row ${n}"></td>
    <td><input type="text" class="input" data-ar-field="responsible" data-ar-row="${n - 1}" placeholder="Name" style="min-width:110px" aria-label="Responsible, row ${n}"></td>
    <td><select class="input" data-ar-field="status" data-ar-row="${n - 1}" style="min-width:120px;font-weight:600;color:var(--red-text);background:var(--red-bg);border-color:var(--red-border)" aria-label="Status, row ${n}">
      <option value="R" selected>R — Behind</option><option value="Y">Y — At Risk</option>
      <option value="G">G — On Track</option><option value="C">C — Completed</option></select></td>`;
  tbody.appendChild(tr);
}

function _saveCurrentStepInputs() {
  if (!_activeKZ) return;
  const panel = document.querySelector('.eightstep__body');
  if (!panel) return;
  const stepN = parseInt(panel.dataset.step, 10);
  const saved = { ...(_stepData[stepN] || {}) };

  panel.querySelectorAll('[data-field]').forEach(el => { saved[el.dataset.field] = el.value; });

  // Action register rows
  const tbody = document.getElementById('action-register-body');
  if (tbody) {
    const arRows = [];
    tbody.querySelectorAll('tr').forEach((tr, i) => {
      const rowData = { no: i + 1 };
      tr.querySelectorAll('[data-ar-field]').forEach(el => { rowData[el.dataset.arField] = el.value; });
      arRows.push(rowData);
    });
    if (arRows.length) saved.actionRows = arRows;
  }

  // Countermeasure matrix rows
  const cmBody = document.getElementById('cm-matrix-body');
  if (cmBody) {
    const cmRows = [];
    cmBody.querySelectorAll('tr').forEach((tr, i) => {
      const row = {};
      tr.querySelectorAll('[data-cm-field]').forEach(el => {
        const f = el.dataset.cmField;
        row[f] = f === 'text' ? el.value : (el.value === '' ? null : Number(el.value));
      });
      cmRows.push(row);
    });
    if (cmRows.length) saved.countermeasures = cmRows;
  }

  _stepData[stepN] = saved;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const PS_STYLES = `
  .ps-view { max-width: 1000px; }
  .ps-view--wizard { max-width: 1360px; }

  /* Step-reach funnel (tracker header card) — counts render via the shared .ps-summary strip */
  .ps-funnel { display:flex; flex-direction:column; align-items:center; gap:4px; }
  .ps-funnel__svg svg { display:block; }

  /* Stall / age flag (tracker rows — real start-date age only, no fabricated per-step timing) */
  .stall-flag { margin-top:4px; font-size:0.68rem; font-weight:600; color:var(--amber-text); white-space:nowrap; }

  /* PDCA badge — plain neutral label (phase is identity, not status). Used by
     the read-only A3 (renderReadA3's stepCard); the wizard's own step head
     uses the shared .running-head instead. */
  .pdca-badge { background:var(--muted); color:var(--text-dim); border:1px solid var(--border); padding:2px 8px; border-radius:var(--radius-sm); font-size:0.68rem; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; }

  /* Docked Mark co-pilot's own proactive suggestion cards (Add/Dismiss) — a
     real feature beyond the static reference's assist panel, nested inside
     the ported .eightstep__assist column (see renderAssistPanel). */
  .assist-items { display:grid; gap:8px; overflow-y:auto; max-height:260px; }
  .mark-item { border:1px solid var(--border-soft); border-radius: var(--radius); padding:8px 10px; background: var(--bg-subtle); }
  .mark-item--added { border-color: var(--green-border); background: var(--green-bg); }
  .mark-item--skipped { opacity:0.5; }
  .mark-item__text { font-size:0.78rem; color: var(--text-secondary); line-height:1.4; }
  .mark-item__tag { font-size:0.6rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color: var(--accent-text); background:var(--panel); border:1px solid hsl(var(--action-3)); border-radius:3px; padding:1px 5px; margin-right:5px; }
  .mark-item__chain { display:flex; flex-direction:column; gap:3px; }
  .mark-item__why { font-size:0.76rem; color: var(--text-secondary); line-height:1.4; }
  .mark-item__why b { color: var(--accent-text); font-family: var(--font-mono); font-size:0.72rem; margin-right:4px; }
  .mark-item__cat { font-size:0.58rem; font-weight:700; text-transform:uppercase; color: var(--text-faint); background: var(--muted); border-radius:3px; padding:0 4px; margin:0 5px 0 2px; }
  .mark-item__root { margin-top:4px; font-size:0.76rem; font-weight:600; color: var(--text); }
  .mark-item__scores { margin-top:4px; font-family: var(--font-mono); font-size:0.68rem; color: var(--text-faint); }
  .mark-item__actions { display:flex; gap:6px; margin-top:8px; }
  .mark-item__btn { flex:1; font-size:0.7rem; font-weight:600; padding:4px 8px; border-radius: var(--radius-sm); cursor:pointer; border:1px solid transparent; }
  .mark-item__btn:disabled { cursor:default; opacity:.6; }
  .mark-item__btn--add { background: var(--accent); color:var(--accent-fg); }
  .mark-item__btn--add:hover:not(:disabled) { background: var(--accent-hover); }
  .mark-item__btn--skip { background:transparent; border-color: var(--border-strong); color: var(--text-dim); }
  .mark-item__btn--skip:hover:not(:disabled) { background: var(--muted); }
  .mark-item__done { margin-top:6px; font-size:0.68rem; font-weight:700; color: var(--green-text); }

  /* Ask-Mark answer entries appended live into .assist-thread (#mark-dock-answers) */
  .mark-answer { font-size:0.75rem; }
  .mark-answer__q { font-weight:700; color: var(--text-secondary); }
  .mark-answer__a { color: var(--text-dim); margin-top:2px; white-space:pre-wrap; }

  /* Secondary 6M contributing-factor mini-table (Step 4, below the 5-Whys
     ladder — see render5Whys6M) */
  .fishbone-tbl { width:100%; border-collapse:collapse; font-size:0.85rem; }
  .fishbone-tbl td { padding:4px 0 4px 4px; }

  /* Countermeasure matrix (read-only A3's renderReadA3 only — the live wizard
     uses the ported global .dt/.score-sel/.score-cell/.cm-text classes) */
  .cm-matrix th, .cm-matrix td { font-size:0.8rem; }
  .cm-matrix .cm-text { min-width:200px; }
  .score-th { text-align:center; }
  .sc { display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:4px; font-family: var(--font-mono); font-weight:700; font-size:0.78rem; }
  .sc--0 { background:var(--red-bg);   color:var(--red-text); }
  .sc--1 { background:var(--amber-bg); color:var(--amber-text); }
  .sc--2 { background:var(--green-bg); color:var(--green-text); }
  .sc--na { background:var(--muted); color:var(--text-faint); }

  /* ODG gate + SOP write-back badges (read-only A3's renderReadA3 only — the
     live wizard uses the shared .badge--{amber/green/neutral} tones) */
  .gate-badge { font-size:0.72rem; font-weight:700; padding:2px 8px; border-radius:3px; margin-left:4px; }
  .gate-badge--pending { background:var(--muted); color:var(--text-faint); }
  .gate-badge--submitted { background:var(--amber-bg); color:var(--amber-text); }
  .gate-badge--approved { background:var(--green-bg); color:var(--green-text); }
  .sop-writeback { margin-top:20px; border:1px solid var(--border-soft); border-radius: var(--radius); padding:16px; background: var(--bg-subtle); }
  .sop-writeback__label { font-size:0.68rem; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:var(--text-faint); margin-bottom:4px; }

  /* Read-only A3 tables (score matrix, action register) */
  .kpi-table th, .kpi-table td { font-size:0.85rem; }
  /* .a3-tag — the read-only A3 header's "A3" mark (renderReadA3 only; the
     tracker's own A3/AI-draft tags moved to .badge/.chip, see renderTrackerTable) */
  .a3-tag { font-size:0.58rem; font-weight:800; letter-spacing:0.04em; color:var(--accent-fg); background: var(--accent); border-radius:3px; padding:1px 5px; vertical-align:middle; }

  /* Read-only A3 */
  .ro-header { display:flex; align-items:flex-start; justify-content:space-between; gap:20px; flex-wrap:wrap; padding-bottom:12px; border-bottom:2px solid var(--border); }
  .ro-header__title { font-family: var(--font-serif); font-size:1.35rem; font-weight:600; }
  .ro-header__meta { display:grid; grid-template-columns: 1fr 1fr; gap:2px 18px; }
  .ro-kv { display:flex; gap:8px; padding:2px 0; font-size:0.83rem; }
  .ro-kv__k { color:var(--text-faint); font-weight:600; min-width:120px; }
  .ro-kv__v { color:var(--text-secondary); }
  .ro-step { border:1px solid var(--border); border-radius: var(--radius); margin-bottom:12px; overflow:hidden; }
  .ro-step__head { display:flex; align-items:center; gap:10px; padding:8px 14px; background: var(--bg-subtle); border-bottom:1px solid var(--border-soft); }
  .ro-step__n { font-family: var(--font-mono); font-size:0.75rem; color:var(--text-faint); font-weight:700; }
  .ro-step__title { font-weight:600; font-size:0.92rem; }
  .ro-step__body { padding:12px 14px; }
  .ro-gap, .ro-prio { margin-top:6px; font-size:0.85rem; }
  .ro-why { display:flex; gap:10px; align-items:baseline; padding:3px 0; font-size:0.84rem; }
  .ro-why__n { font-family: var(--font-mono); font-weight:700; color:var(--accent-text); min-width:46px; }
  .ro-why__cat { font-size:0.6rem; font-weight:700; text-transform:uppercase; color:var(--text-faint); background:var(--muted); border-radius:3px; padding:1px 6px; min-width:70px; text-align:center; }
  .ro-rootcause { margin-top:10px; font-size:0.86rem; }
  .ro-altchains { margin-top:8px; }
  .ro-altchain { border:1px dashed var(--border-strong); border-radius:4px; padding:8px 10px; margin-bottom:6px; }
  .ro-alt-why { font-size:0.78rem; color:var(--text-dim); }
  .ro-alt-root { font-size:0.78rem; color:var(--text); font-weight:600; margin-top:3px; }
  .ro-narr { margin-top:8px; font-size:0.83rem; line-height:1.5; color:var(--text-secondary); background:var(--bg-subtle); border-radius:4px; padding:8px 10px; }
  .ro-gate { margin-top:10px; font-size:0.85rem; }
  .ar-status { display:inline-block; width:22px; text-align:center; font-family: var(--font-mono); font-weight:700; border-radius:4px; }
  .ar-status--R { background:var(--red-bg);   color:var(--red-text); }
  .ar-status--Y { background:var(--amber-bg); color:var(--amber-text); }
  .ar-status--G { background:var(--green-bg); color:var(--green-text); }
  .ar-status--C { background:hsl(var(--action-1)); color:var(--accent-text); }
`;

(function injectStyles() {
  // Guard for non-browser module loads (node --test importing this file to
  // reach an exported pure helper like aiDraftCandidatesFromRedKpis — see
  // tests/problemsolving-view.test.mjs). No behavior change in the browser,
  // where `document` always exists.
  if (typeof document === 'undefined') return;
  if (document.getElementById('ps-styles')) return;
  const el = document.createElement('style');
  el.id = 'ps-styles';
  el.textContent = PS_STYLES;
  document.head.appendChild(el);
})();

// ─── Public entry point ───────────────────────────────────────────────────────

/**
 * renderProblemSolving(dept, mount)
 * @param {object} dept   — department data object (from data/<id>.json)
 * @param {Element} mount — DOM element to render into
 */
async function renderProblemSolving(dept, mount) {
  _dept = dept;
  _mount = mount;
  _activeKZ = null;
  _readKZ = null;
  _currentStep = 1;
  _stepData = {};
  _kzRecords = [];
  _template = null;
  _sopWrittenBack = false;
  _markStepHelp = null;

  // R3 handoff: hash ?kpi=<id> pre-opens the wizard for that sub-KPI. Ask
  // Mark's escalation read-back (Fix 1) additionally carries &kz=<kzNumber>
  // so the handoff can open the REAL linked KZ record instead of always
  // minting a fresh blank one for the KPI.
  const hashQuery = location.hash.includes('?') ? location.hash.split('?')[1] : '';
  const hashParams = new URLSearchParams(hashQuery);
  const preselectKpiId = hashParams.get('kpi') || null;
  const preselectKzNumber = hashParams.get('kz') || null;

  mount.innerHTML = `<p class="text-muted" style="padding:24px 0">Loading problem-solving data…</p>`;
  await doRender(); // populates _kzRecords, needed for the kz-param lookup below

  // Prefer a REAL linked KZ when the deep-link resolves to an actual record
  // on file (e.g. KZ-346, linked via linkedKpiId to otp_mexico). No kz param
  // at all (Ask Mark's escalation no longer fabricates one for a fresh
  // draft — see views/askmark.js's resolveKzNumber) falls through unchanged
  // to the existing ?kpi= mint-a-fresh-wizard handoff below.
  const realKz = preselectKzNumber
    ? _kzRecords.find((k) => k.kzNumber === preselectKzNumber)
    : null;

  if (realKz) {
    if (isCompletedA3(realKz)) {
      _readKZ = realKz;
    } else {
      _activeKZ = realKz;
      _activeKZ._kpiId = realKz.linkedKpiId || preselectKpiId;
      _activeKZ._prior = priorSimilarKZ(_dept);
      _activeKZ._sop   = govSop(_dept);
      let firstOpenStep = 1;
      const steps = realKz.steps || {};
      for (let n = 1; n <= 8; n++) {
        if (!steps[String(n)]) { firstOpenStep = n; break; }
      }
      _currentStep = firstOpenStep;
      _stepData = {};
    }
    await doRender();
    return;
  }

  if (preselectKpiId && _dept && _dept.kpis) {
    const kpi = _dept.kpis.find(k => k.id === preselectKpiId);
    if (kpi) {
      const sel = document.getElementById('ps-kpi-select');
      if (sel) sel.value = preselectKpiId;
      _activeKZ = newKZ({ item: kpi.name || 'Problem', who: _dept.lead || '', deptId: _dept.id });
      _activeKZ._kpiId = preselectKpiId;
      _activeKZ._prior = priorSimilarKZ(_dept);
      _activeKZ._sop   = govSop(_dept);
      _currentStep = 1;
      _stepData = {};
      await doRender();
    }
  }
}

;return { aiDraftCandidatesFromRedKpis, renderProblemSolving };
})();

/* ==== views/sources.js ==== */
__M["views/sources.js"] = (function(){
/**
 * views/sources.js — "Sourcing Plan" (where every number comes from)
 *
 * renderSources(dept, mount)
 *
 * Markup rebuilt to the §5.7 Sources idiom (docs/redesign/DESIGN-GUIDE.md +
 * docs/redesign/reference/view-rest.js's `VIEWS.sources`) — `.page-head`,
 * a target-systems summary `.card--pad`, an amber-left-border banner, a
 * `.grid` of `.card`s "By source system" (each real KPI row wearing a
 * `.badge--amber` "re-keyed today" or `.badge--green` "direct pull"), a
 * 3-node `.flow` (Source system → FMDS vault → FMDS board, middle node
 * `.flow__node--accent`), and a `.board-hint`. Every class here is already
 * ported into styles.css by the Phase-1 tasks — no local `<style>`
 * injection, unlike the pre-rebuild file, which shipped ~50 lines of scoped
 * CSS for one-off `.src-*` classes.
 *
 * Data lookups are unchanged in *behavior* from the pre-rebuild file — only
 * the markup moved, plus one real classification fix:
 *
 *   - `hasNoSystem(kpi)` generalizes the old `isManualOnly(kpi)` (which only
 *     checked `kpi.manualOnly === true`) to also catch KPIs whose
 *     `targetSource` literally says there isn't one yet. data/hr.json's
 *     `bench_strength` has `targetSource: "TBD — no source system"` and
 *     `manualOnly` unset — the pre-rebuild file's `groupByTargetSource`
 *     would have put it in its own "BY SOURCE SYSTEM" card literally titled
 *     "TBD — no source system" wearing a green/amber pull badge, which is
 *     nonsense for a KPI that has no system to pull from. It now buckets
 *     with HR's 6 real `manualOnly` TRIR items into one "No source system"
 *     card, same treatment the pre-rebuild file already gave manualOnly
 *     KPIs. Not new data — `bench_strength`'s own `targetSource` string is
 *     what triggers it.
 *   - `INTEGRATED_SYSTEMS` (a large hardcoded system-name allowlist) is
 *     dropped — grep confirms it was dead code in the pre-rebuild file
 *     (defined, never referenced). Grouping always ran off `targetSource`/
 *     `source` directly, not that set.
 *   - The old file's standalone "Per-KPI Detail" `.src-table` (KPI · Target
 *     Source · Sourcing Status · Today · Action, five columns duplicating
 *     what each source-system card row already shows) is gone. The
 *     reference's Sources page has no equivalent section, and once every
 *     KPI already appears once in its source-system card with its
 *     re-keyed/direct-pull badge, a second full table restating the same
 *     KPI→system→status facts is exactly the "banner restating what a chip
 *     can say" §6 anti-pattern.
 *
 * Zero-invented-data / generalization notes (every dept's source mapping is
 * real, pulled from data/<dept>.json's kpi.targetSource / kpi.source /
 * kpi.manualOnly — nothing here is Operations-specific):
 *   - "BY SOURCE SYSTEM" renders one card per *distinct* `targetSource`
 *     string the department's KPIs actually carry — Operations gets WPS +
 *     Business Central (2 cards); Finance gets Business Central alone (1);
 *     IT gets its two literal Azure DevOps variants (2, kept distinct
 *     because "Azure DevOps" and "Azure DevOps / monitoring" are different
 *     recorded strings — collapsing them would be inventing a merge the
 *     data doesn't state); ODG gets "ODG FMDS Board" (1); Sales/Service/HR/
 *     Logistics/Marketing get however many distinct strings their KPIs use
 *     (Marketing has 19 — every one renders, no cap, no invented grouping).
 *   - Depts with zero manual/no-system KPIs (Operations, Finance, IT,
 *     Marketing, ODG, Sales) simply render no "No source system" card and
 *     no amber double-entry banner if `reKeyedKpis.length` is 0 — both
 *     sections are conditional on real counts, never rendered empty.
 *   - The flow diagram's first node lists the department's own real system
 *     names (joined) as its sub-line — never a fixed "WPS · BC" placeholder.
 */

// ─── Small shared helpers ───────────────────────────────────────────────────

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Right-pointing arrow — ported verbatim from reference/app.js's `ICONS.arrow`
// (this file's only use of it; not worth adding to app.js's shared ICONS set
// for a single flow diagram two views away from the shell).
const ARROW_SVG = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';

function levelLabel(level) {
  if (level === 1) return 'Main';
  if (level === 2) return 'Contributor';
  if (level === 3) return 'Rep / Sub';
  return `L${level}`;
}

/** Canonical target source from kpi.targetSource (preferred) or kpi.source. */
function targetSource(kpi) {
  if (kpi.targetSource) return kpi.targetSource;
  if (kpi.source && kpi.source !== '—') return kpi.source;
  return '—';
}

/**
 * True when a KPI has no real source system to connect — either explicitly
 * flagged (`manualOnly: true`, e.g. HR's safety TRIR items — human-reported
 * incident counts) or its `targetSource` string itself says there isn't one
 * yet (e.g. "TBD — no source system", "—", empty). See file header.
 */
function hasNoSystem(kpi) {
  if (kpi.manualOnly === true) return true;
  const ts = kpi.targetSource;
  if (!ts || ts === '—') return true;
  if (/\btbd\b|no source system/i.test(ts)) return true;
  return false;
}

/**
 * True when today's number is re-keyed by hand into the board rather than
 * pulled directly from its target system — the double-entry FMDS OS
 * eliminates. Heuristic: `kpi.source` names a hand-keyed board/spreadsheet
 * token, or `source`/`targetSource` differ (today's path isn't the target
 * path yet).
 */
function isTodayReKeyed(kpi) {
  const src = (kpi.source || '').toLowerCase();
  const handKeyedTokens = [
    'bowler', 'sharepoint', 'coo board', 'odg fmds board', 'odg board',
    'sales board', 'finance board', 'hand-keyed', 'manual', 'literal',
    'cached', 're-key', 'rekey',
  ];
  for (const tok of handKeyedTokens) {
    if (src.includes(tok)) return true;
  }
  if (kpi.source && kpi.targetSource && kpi.source !== kpi.targetSource) return true;
  return false;
}

/** Groups the department's real (has-a-system) KPIs by their targetSource string. */
function groupByTargetSource(kpis) {
  const groups = {};
  const order = [];
  for (const kpi of kpis) {
    const ts = targetSource(kpi);
    if (!groups[ts]) { groups[ts] = []; order.push(ts); }
    groups[ts].push(kpi);
  }
  return { groups, order };
}

// ─── By-source-system card ────────────────────────────────────────────────

function sourceSystemRowHTML(kpi) {
  const reKeyed = isTodayReKeyed(kpi);
  return `
    <div class="src-sys-row" style="display:flex; align-items:center; gap:10px; padding:7px 0; border-bottom:1px solid var(--border-soft); font-size:13px">
      <span style="flex:1; min-width:0">
        ${esc(kpi.name)}
        <span class="faint" style="font-size:11.5px"> · ${esc(levelLabel(kpi.level || 1))}</span>
      </span>
      ${reKeyed
        ? '<span class="badge badge--amber"><span class="dot"></span>re-keyed today</span>'
        : '<span class="badge badge--green"><span class="dot"></span>direct pull</span>'}
    </div>`;
}

function sourceSystemCardHTML(ts, kpis) {
  return `
    <section class="card">
      <div style="display:flex; align-items:baseline; justify-content:space-between; padding:16px 24px; border-bottom:1px solid var(--border-soft)">
        <h3>${esc(ts)}</h3><span class="muted" style="font-size:12.5px">${kpis.length} KPI${kpis.length !== 1 ? 's' : ''}</span>
      </div>
      <div style="padding:12px 24px 16px">
        ${kpis.map(sourceSystemRowHTML).join('')}
      </div>
    </section>`;
}

function noSystemCardHTML(kpis) {
  const rows = kpis.map((k) => `
    <div class="src-sys-row" style="display:flex; align-items:center; gap:10px; padding:7px 0; border-bottom:1px solid var(--border-soft); font-size:13px">
      <span style="flex:1; min-width:0">
        ${esc(k.name)}
        <span class="faint" style="font-size:11.5px"> · ${esc(levelLabel(k.level || 1))}</span>
      </span>
      <span class="badge badge--outline">no source system</span>
    </div>`).join('');

  return `
    <section class="card">
      <div style="display:flex; align-items:baseline; justify-content:space-between; padding:16px 24px; border-bottom:1px solid var(--border-soft)">
        <h3>No source system</h3><span class="muted" style="font-size:12.5px">${kpis.length} KPI${kpis.length !== 1 ? 's' : ''}</span>
      </div>
      <div style="padding:12px 24px 16px">
        ${rows}
        <p class="faint" style="margin:10px 0 0; font-size:12px; line-height:1.5">No source system identified for these KPIs — entered manually where a number exists.</p>
      </div>
    </section>`;
}

// ─── Public entry point ───────────────────────────────────────────────────

function renderSources(dept, mount) {
  const kpis        = dept.kpis || [];
  const noSystem     = kpis.filter(hasNoSystem);
  const realKpis     = kpis.filter((k) => !hasNoSystem(k));
  const { groups, order: systems } = groupByTargetSource(realKpis);
  const reKeyedKpis  = realKpis.filter(isTodayReKeyed);
  const totalKpis    = kpis.length;

  const statLine = `${totalKpis} KPI${totalKpis !== 1 ? 's' : ''} · ${systems.length} source system${systems.length !== 1 ? 's' : ''} · ${noSystem.length} manual-only`;

  const sysBadges = systems.map((ts) => `<span class="badge badge--neutral">${esc(ts)}</span>`).join('');
  const manualBadge = noSystem.length
    ? `<span class="badge badge--outline">${noSystem.length} manual-only</span>`
    : '';

  const amberBanner = reKeyedKpis.length ? `
    <section class="card card--pad" style="border-left:3px solid var(--amber); margin-bottom:32px">
      <b style="font-size:13.5px; color:var(--amber-text)">Double-entry being eliminated.</b>
      <span style="font-size:13.5px; color:var(--text-secondary)"> ${reKeyedKpis.length} KPI${reKeyedKpis.length !== 1 ? 's are' : ' is'} currently re-keyed from a source system into the board today — FMDS OS replaces ${reKeyedKpis.length !== 1 ? 'these' : 'this'} with a direct pull from the source, removing the manual step entirely.</span>
    </section>` : '';

  const systemCards = systems.map((ts) => sourceSystemCardHTML(ts, groups[ts])).join('');
  const noSystemCard = noSystem.length ? noSystemCardHTML(noSystem) : '';

  const bySourceSection = (systems.length || noSystem.length) ? `
    <div class="section-head"><span class="running-head">By source system</span></div>
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(320px,1fr))">
      ${systemCards}${noSystemCard}
    </div>` : `<p class="muted">No source data defined for this department yet.</p>`;

  const sourceNodeSub = systems.length ? esc(systems.join(' · ')) : 'No connected systems yet';
  const flowNote = reKeyedKpis.length
    ? `${reKeyedKpis.length} KPI${reKeyedKpis.length !== 1 ? 's' : ''} above ${reKeyedKpis.length !== 1 ? 'are' : 'is'} re-keyed today — FMDS OS eliminates that double-entry once the vault connects directly to the source system.${noSystem.length ? ` ${noSystem.length} item${noSystem.length !== 1 ? 's remain' : ' remains'} manual — no source system exists to connect.` : ''}`
    : (noSystem.length
      ? `All connected KPIs in this department are already on a direct-pull path. ${noSystem.length} item${noSystem.length !== 1 ? 's remain' : ' remains'} manual — no source system exists to connect.`
      : `All KPIs in this department are on a direct-pull path — no re-keying left to eliminate.`);

  mount.innerHTML = `
    <div class="page-head">
      <div>
        <span class="running-head page-head__eyebrow">${esc(dept.name)} · Data Lineage</span>
        <h1>Sourcing Plan</h1>
        <p class="page-head__sub">Where each number comes from. The number is sourced — not re-keyed.</p>
      </div>
      <div class="page-head__side"><button class="btn btn--secondary" data-go="kpi">KPI Boards</button></div>
    </div>

    <section class="card card--pad" style="display:flex; align-items:center; gap:20px; flex-wrap:wrap; margin-bottom:16px">
      <span class="running-head">Target source systems</span>
      ${sysBadges}
      ${manualBadge}
      <span class="muted" style="font-size:13px; margin-left:auto">${statLine}</span>
    </section>

    ${amberBanner}

    ${bySourceSection}

    <div class="section-head"><span class="running-head">Target data flow — single entry point</span></div>
    <section class="flow">
      <div class="flow__node">
        <h4>Source system</h4><p>${sourceNodeSub}</p>
      </div>
      <span class="flow__arrow">${ARROW_SVG}</span>
      <div class="flow__node flow__node--accent">
        <h4>FMDS vault</h4><p>Single entry point</p>
      </div>
      <span class="flow__arrow">${ARROW_SVG}</span>
      <div class="flow__node">
        <h4>FMDS board</h4><p>Reads the vault — never re-keys</p>
      </div>
    </section>
    <p class="board-hint">${flowNote}</p>`;

  mount.addEventListener('click', (e) => {
    const goBtn = e.target.closest('[data-go]');
    if (goBtn) location.hash = `#/dept/${dept.id}/${goBtn.dataset.go}`;
  });
}

;return { renderSources };
})();

/* ==== views/standardwork.js ==== */
__M["views/standardwork.js"] = (function(){
/**
 * views/standardwork.js — Standard Work view (linked SOP library + SOP detail)
 *
 * renderStandardWork(dept, mount)
 *
 * Markup rebuilt to the §5.6 Standard Work idiom (docs/redesign/DESIGN-GUIDE.md
 * + docs/redesign/reference/view-rest.js) — the shared `.dt` table / `.card`
 * `--pad`/`--interactive` / `.chip` / `.badge` / `.count-pill` / `.doc-type` /
 * `.page-head` components every other rebuilt view (views/kpi.js is the model
 * cited for this task) already uses. Every class here comes from the ported
 * base/view-component CSS in styles.css — no local `<style>` injection, unlike
 * the pre-rebuild file, which shipped ~390 lines of now-redundant scoped CSS.
 * Data lookups (data/sop-library.json, data/sops/*.json, the LSW cadence
 * grouping, the KZ→SOP backlink map) and behavior (search-filter, open/close
 * an embedded SOP) are unchanged from before this rebuild — only the markup,
 * plus real fixes, moved:
 *
 *   - LIBRARY: one flat `.dt` table (Type|Document|Area/Product|Owner|Lang|
 *     Link) per the reference — the pre-rebuild file's per-doc-type grouped
 *     mini-tables + type-filter tabs are gone; that grouping/tab layer isn't
 *     in the reference or DESIGN-GUIDE spec, and dropping it is a markup
 *     simplification, not a data loss (every doc still renders, just in one
 *     table instead of ten). The search-filter behavior is kept, re-wired to
 *     the flat table.
 *   - Per-type/per-drive/per-lang VIZ-PALETTE COLOR CODING is gone. The
 *     reference's `.doc-type` is a single flat mono-chip style, not a
 *     per-type-colored one — matching it removes DOC_TYPE_COLORS/vizTriplet/
 *     typeBadge/driveBadge/langTag entirely in favor of the plain `.doc-type`/
 *     `.chip`/`.badge--neutral` classes already ported. Zero data lost — type,
 *     drive, and lang strings still render, just uncolored.
 *   - BUG-shaped anti-pattern fix: `freqTokens()` tinted LSW cadence
 *     frequency chips green/amber/accent by daily-vs-weekly-vs-monthly — i.e.
 *     RAG-adjacent hues used decoratively on a non-status field, exactly the
 *     "RAG hues are status-only, never decorative" anti-pattern the redesign
 *     spec calls out. Cadence frequency is now a plain mono `.chip`, no color.
 *   - The `href`-based "Open in SharePoint ↗" link branch is gone: every one
 *     of the 72 real documents across all 9 departments has `href: null` (the
 *     discovery only ever recorded a webUrl for zero docs) — that branch was
 *     dead code before this rebuild too. Matching the reference's real
 *     two-state link cell (`Open In-App` / `link pending`) loses nothing.
 *   - SOP DETAIL fixes all five §5.6 problems (see sopDetailHTML below):
 *     (1) h1 24px/30ch, (2) Back-to-Library moved into `.page-head__side` as
 *     `--secondary`, (3) Purpose+Scope share one `.card--pad` with
 *     running-heads and linked forms move into the backlinks card as a dim
 *     line, (4) steps table is the standard `.dt` with zero italics
 *     (`Key points` 400/`--text-secondary`, `Reason` 400/`--text-dim`, `#`
 *     via `.tnum`), (5) 8-step backlinks + Revision log render as two
 *     side-by-side `.card`s below the table.
 *   - `?sop=<id>` deep-link now consumed: app.js's router comment has long
 *     documented `sop` as "reserved for opening a specific Standard Work SOP
 *     detail (Task 12 — standardwork.js)" — no prior view ever parsed it.
 *     This rebuild reads it the same way problemsolving.js reads `?kpi=`/
 *     `?kz=` (split the hash on `?`, URLSearchParams) and pre-opens the
 *     matching embedded SOP if the id is real for this department; otherwise
 *     it falls through to the library, same as no param at all.
 *   - KNOWN DATA BUG FIXED: data/sops/_lsw.json had no `id` field, so its
 *     embedded-SOP card's `data-open-sop` id resolved to an empty string —
 *     clicking it silently no-opened (the click handler now guards on a
 *     falsy id too, belt-and-suspenders). Fixed by adding `"id": "_lsw"` to
 *     the JSON — matching the `sop.cadenceRows` shape check already used to
 *     detect "this embedded SOP is the LSW cadence, not a stepped BWI" and
 *     the DEPT_SOPS→_lsw.json wiring that already expected an id.
 *   - The real KZ→SOP write-back backlinks (SOP_KZ_BACKLINKS — KZ-346 on the
 *     operations Short-Code BWI, KZ-303 on the service Prospecting BWI) are
 *     unchanged and still render on both the library's featured card(s) (as
 *     an `Updated by <KZ> …` info badge) and the SOP detail's "8-step
 *     backlinks" card.
 *   - Frozen-dept handling needs no in-view logic: app.js's navFor() never
 *     shows the Standard Work nav item for a frozen dept at all (unchanged),
 *     so this view only needs its existing graceful "no library data yet"
 *     fallback for the (currently theoretical) case of a dept with no
 *     sop-library.json entry.
 */

// ─── SOP (full-content) registry per department ───────────────────────────────
const DEPT_SOPS = {
  operations: ['data/sops/operations-shortcode.json'],
  service:    ['data/sops/service-prospecting.json'],
  sales:      [],
  hr:         [],
  odg:        ['data/sops/_lsw.json'],
  marketing:  [],
  logistics:  [],
  it:         [],
  finance:    [],
};

// KZ backlinks: sopId → array of KZ references (Step 8 updated this SOP)
const SOP_KZ_BACKLINKS = {
  'operations-shortcode': [
    { kzNumber: 'KZ-346', title: 'Pricing Credit Memos (Galls Color)', step: 8 },
  ],
  'service-prospecting': [
    { kzNumber: 'KZ-303', title: 'HP Quote-to-Order (Alison Diaco)', step: 8 },
  ],
};

// Drive display metadata (label + tooltip) for the library's collection
// badges — identity-only, rendered as plain `.badge--neutral`, never a
// status hue.
const DRIVE_META = {
  WMS_SOP:         { label: 'WMS SOP',         desc: 'World Emblem Management System — 868 docs, operational SWIs' },
  QA_SOP:          { label: 'QA SOP',          desc: 'Quality Assurance — 2,525 ISO-coded procedures (PR/FR/DA/IN)' },
  ODG_LSW:         { label: 'ODG LSW (live)',  desc: 'ODG Leader Standard Work — live drive' },
  ODG_LSW_Archive: { label: 'ODG LSW Archive', desc: 'ODG Leader Standard Work — 98 historical files by role/location' },
};

// ─── Module-scope fetch caches (persist across renderStandardWork calls) ─────
let _sopCache = {}; // path → parsed JSON (full-content SOPs)
let _libData  = null; // sop-library.json content

// ─── Small shared helpers ───────────────────────────────────────────────────

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Cadence frequency → one of 4 display bands. Pure data grouping (no color) —
// used to break the LSW detail's cadence rows into Daily/Weekly/Monthly/Other
// sections, same grouping the pre-rebuild file used.
function freqGroup(freq) {
  if (!freq) return 'Other';
  const f = freq.toLowerCase();
  if (f.includes('daily') || f.includes('4x') || f.includes('2x')) return 'Daily';
  if (f.includes('weekly') || f.includes('bi-week')) return 'Weekly';
  if (f === 'monthly' || f.includes('3x/mo')) return 'Monthly';
  return 'Other';
}

function matchesSearch(doc, search) {
  return (
    (doc.title || '').toLowerCase().includes(search) ||
    (doc.area || '').toLowerCase().includes(search) ||
    (doc.product || '').toLowerCase().includes(search) ||
    (doc.owner || '').toLowerCase().includes(search) ||
    (doc.docType || '').toLowerCase().includes(search)
  );
}

function lastRevision(sop) {
  return (sop.revisions && sop.revisions.length) ? sop.revisions[sop.revisions.length - 1] : null;
}

// A library row's `sopDataPath` is the join key back to the loaded
// full-content SOP object (DEPT_SOPS) — resolves to its real `.id` (the id
// `data-open-sop` needs) so the row's "Open In-App" button opens the exact
// SOP the row describes.
function embeddedSopId(doc) {
  if (!doc.embeddedInApp || !doc.sopDataPath) return null;
  const cached = _sopCache[doc.sopDataPath];
  return (cached && cached.id) || null;
}

// ─── A. LINKED LIBRARY (from sop-library.json) ───────────────────────────────

function buildCountPills(counts) {
  const snap = [
    ['WMS_SOP_BWI', 'BWI'],
    ['WMS_SOP_SWI', 'SWI'],
    ['WMS_SOP_Procedure', 'Procedure'],
    ['WMS_SOP_total', 'WMS docs'],
    ['QA_SOP_PO_total', 'QA-PO docs'],
    ['QA_SOP_RH_total', 'QA-RH docs'],
    ['QA_SOP_SI_total', 'QA-SI docs'],
    ['QA_SOP_AC_total', 'QA-AC docs'],
    ['QA_SOP_MT_total', 'QA-MT docs'],
    ['QA_SOP_AD_total', 'QA-AD docs'],
    ['QA_SOP_LG_total', 'QA-LG docs'],
    ['QA_SOP_VE_total', 'QA-VE docs'],
    ['QA_SOP_MK_total', 'QA-MK docs'],
    ['QA_SOP_FI_total', 'QA-FI docs'],
    ['ODG_LSW_live_files', 'LSW (live)'],
    ['ODG_LSW_Archive_total', 'LSW Archive'],
  ];
  return snap
    .filter(([key]) => typeof counts[key] === 'number' && counts[key] > 0)
    .map(([key, label]) => `<span class="count-pill"><b>${counts[key]}</b>${esc(label)}</span>`)
    .join('');
}

function driveBadgeHTML(drive) {
  const m = DRIVE_META[drive];
  return m
    ? `<span class="badge badge--neutral" title="${esc(m.desc)}">${esc(m.label)}</span>`
    : `<span class="badge badge--neutral">${esc(drive)}</span>`;
}

function docRowHTML(doc) {
  const repBadge = doc.representative
    ? `<span class="badge badge--amber" style="font-size:10px">representative</span>`
    : '';
  const noteIcon = doc.note
    ? `<span title="${esc(doc.note)}" style="cursor:help;color:var(--text-faint);margin-left:4px">&#9432;</span>`
    : '';
  const sopId = embeddedSopId(doc);
  const linkCell = (doc.embeddedInApp && sopId)
    ? `<button class="btn btn--outline btn--sm" data-open-sop="${esc(sopId)}">Open In-App</button>`
    : `<span class="badge badge--outline">link pending</span>`;

  return `
    <tr>
      <td><span class="doc-type">${esc(doc.docType)}</span></td>
      <td>${esc(doc.title)}${repBadge}${noteIcon}</td>
      <td style="color:var(--text-dim)">
        ${doc.area ? esc(doc.area) : ''}
        ${doc.product ? `<div class="faint" style="font-size:11.5px">${esc(doc.product)}</div>` : ''}
      </td>
      <td style="color:var(--text-dim)">${doc.owner ? esc(doc.owner) : '—'}</td>
      <td>${doc.lang ? `<span class="chip">${esc(doc.lang)}</span>` : ''}</td>
      <td>${linkCell}</td>
    </tr>`;
}

// ─── B. EMBEDDED SOPs (in-app full content) — library "featured" cards ──────

function featuredSopMeta(sop, isLsw) {
  if (isLsw) {
    const n = (sop.cadenceRows || []).length;
    return n ? `${n} cadence activities` : '';
  }
  const rev = lastRevision(sop);
  return [
    sop.steps && sop.steps.length ? `${sop.steps.length} steps` : '',
    rev ? `Rev ${rev.revision} · ${rev.date}` : '',
  ].filter(Boolean).join(' · ');
}

function featuredSopsHTML(sopObjects) {
  if (!sopObjects.length) return '';

  const cards = sopObjects.map((sop) => {
    const isLsw = !!sop.cadenceRows;
    const docType = isLsw ? 'LSW' : (sop.docType || 'BWI');
    const purpose = isLsw ? (sop.note || 'Leader Standard Work cadence') : sop.purpose;
    const meta = featuredSopMeta(sop, isLsw);
    const backlinks = SOP_KZ_BACKLINKS[sop.id] || [];

    return `
    <section class="card card--pad sop-feature card--interactive" data-open-sop="${esc(sop.id)}" role="button" tabindex="0">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px">
        <span class="doc-type">${esc(docType)}</span>
        <span class="badge badge--green">Full content in-app</span>
        <span style="margin-left:auto; color:var(--text-faint)">&rarr;</span>
      </div>
      <h3>${esc(sop.title)}</h3>
      <p style="margin:8px 0; font-size:13.5px; color:var(--text-secondary); max-width:100ch">${esc(purpose)}</p>
      <div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap">
        ${meta ? `<span class="source-note">${esc(meta)}</span>` : ''}
        ${backlinks.map((bl) => `<span class="badge badge--info"><span class="dot"></span>Updated by ${esc(bl.kzNumber)} — ${esc(bl.title)}</span>`).join('')}
      </div>
    </section>`;
  }).join('');

  return `
    <div class="section-head"><span class="running-head">SOPs available in-app</span></div>
    <div class="grid">${cards}</div>`;
}

// ─── C. Library page ─────────────────────────────────────────────────────────

function libraryHTML(dept, state) {
  const deptLib = state.deptLib;
  const search = state.filterText.trim().toLowerCase();

  const searchBox = `
    <div class="page-head__side">
      <input class="input" id="sw-search" style="width:220px" type="search" placeholder="Search documents" aria-label="Search documents" value="${esc(state.filterText)}">
    </div>`;

  const head = `
    <div class="page-head">
      <div>
        <span class="running-head page-head__eyebrow">${esc(dept.name)} · Document Library</span>
        <h1>Standard Work</h1>
        <p class="page-head__sub">Per-department document library — SharePoint-linked. Embedded SOPs open in-app.</p>
      </div>
      ${searchBox}
    </div>`;

  if (!deptLib) {
    return `${head}<p style="padding:24px 0; color:var(--text-faint)">No library data for ${esc(dept.name)} yet.</p>${featuredSopsHTML(state.sopObjects)}`;
  }

  const docs = deptLib.documents || [];
  const filtered = search ? docs.filter((d) => matchesSearch(d, search)) : docs;
  const rows = filtered.length
    ? filtered.map(docRowHTML).join('')
    : `<tr><td colspan="6" style="text-align:center; padding:24px; color:var(--text-faint)">No documents match "${esc(state.filterText)}"</td></tr>`;

  const countPills = buildCountPills(deptLib.counts || {});
  const collectionBadges = (deptLib.drives || []).map(driveBadgeHTML).join(' ');

  return `
    ${head}

    <div class="doc-counts" style="margin-bottom:24px">
      ${countPills}
      <span style="flex:1"></span>
      ${collectionBadges}
    </div>

    <div class="table-wrap"><div class="table-scroll">
      <table class="dt">
        <thead><tr><th>Type</th><th style="min-width:320px">Document</th><th>Area / Product</th><th>Owner</th><th>Lang</th><th>Link</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div></div>

    ${featuredSopsHTML(state.sopObjects)}

    <p class="board-hint"><b>representative</b> = inferred from aggregate counts only — exact title not enumerated in the discovery. <b>link pending</b> = doc confirmed in SharePoint; deep-link not yet mapped.</p>`;
}

// ─── D. SOP detail page — fixes all 5 named §5.6 problems ───────────────────

function sopDetailHTML(sop) {
  if (sop.cadenceRows) return lswDetailHTML(sop);

  const backlinks = SOP_KZ_BACKLINKS[sop.id] || [];
  const linkedForms = sop.linkedForms || [];
  const rev = lastRevision(sop);
  const eyebrow = ['Standard Work', sop.docType || 'BWI', rev ? `Rev ${rev.revision}` : null, rev ? rev.date : null]
    .filter(Boolean).join(' · ');

  const stepsRows = (sop.steps || []).map((st) => `
    <tr>
      <td class="tnum">${esc(st.n)}</td>
      <td>${esc(st.mainStep)}</td>
      <td style="font-weight:400; color:var(--text-secondary)">${esc(st.keyPoints)}</td>
      <td style="font-weight:400; color:var(--text-dim)">${esc(st.reason)}</td>
    </tr>`).join('');

  const backlinksBody = backlinks.length
    ? backlinks.map((bl) => `<p style="margin:10px 0 0; font-size:13.5px"><span style="font-family:var(--font-mono); color:var(--text-dim)">${esc(bl.kzNumber)}</span> · ${esc(bl.title)} · Step ${esc(bl.step)} — Standardize</p>`).join('')
    : `<p style="margin:10px 0 0; font-size:13px; color:var(--text-faint)">No 8-step write-back linked yet.</p>`;
  const linkedFormsLine = linkedForms.length
    ? `<p style="margin:6px 0 0; font-size:12.5px; color:var(--text-faint)">Linked forms: ${linkedForms.map(esc).join(' · ')}</p>`
    : '';

  const revisionsBody = (sop.revisions && sop.revisions.length)
    ? sop.revisions.map((r) => `<p style="margin:10px 0 0; font-size:13px"><b class="tnum">${esc(r.date)}</b> · Rev ${esc(r.revision)} — <span style="color:var(--text-dim)">${esc(r.description)}</span></p>`).join('')
    : `<p style="margin:10px 0 0; font-size:13px; color:var(--text-faint)">No revisions logged.</p>`;
  const elaboratedLine = sop.elaborated
    ? `<p style="margin:8px 0 0; font-size:11.5px; color:var(--text-faint)">Elaborated by: ${esc(sop.elaborated)}</p>`
    : '';

  return `
    <div class="page-head">
      <div>
        <span class="running-head page-head__eyebrow">${esc(eyebrow)}</span>
        <h1 style="font-size:24px; max-width:30ch">${esc(sop.title)}</h1>
      </div>
      <div class="page-head__side">
        <button class="btn btn--secondary" data-back-to-library>Back to Library</button>
      </div>
    </div>

    <section class="card card--pad" style="margin-bottom:24px">
      <span class="running-head">Purpose</span>
      <p style="margin:8px 0 16px; font-size:13.5px; line-height:1.6; color:var(--text-secondary); max-width:100ch">${esc(sop.purpose)}</p>
      <span class="running-head">Scope</span>
      <p style="margin:8px 0 0; font-size:13.5px; line-height:1.6; color:var(--text-secondary); max-width:100ch">${esc(sop.scope)}</p>
    </section>

    <div class="section-head"><span class="running-head">Standard work steps</span></div>
    <div class="table-wrap"><div class="table-scroll">
      <table class="dt">
        <thead><tr><th style="width:36px">#</th><th style="min-width:220px">Main step</th><th style="min-width:280px">Key points</th><th style="min-width:280px">Reason / why it matters</th></tr></thead>
        <tbody>${stepsRows}</tbody>
      </table>
    </div></div>

    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); margin-top:24px">
      <section class="card card--pad">
        <span class="running-head">8-step backlinks</span>
        ${backlinksBody}
        ${linkedFormsLine}
      </section>
      <section class="card card--pad">
        <span class="running-head">Revision log</span>
        ${revisionsBody}
        ${elaboratedLine}
      </section>
    </div>

    ${sop.note ? `<p class="board-hint">${esc(sop.note)}</p>` : ''}`;
}

// ─── E. LSW cadence detail (ODG's embedded _lsw.json) ───────────────────────

function lswDetailHTML(lsw) {
  const groups = ['Daily', 'Weekly', 'Monthly', 'Other'];
  const byGroup = {};
  groups.forEach((g) => { byGroup[g] = []; });
  (lsw.cadenceRows || []).forEach((row) => {
    byGroup[freqGroup(row.frequency)].push(row);
  });

  const groupsHtml = groups.map((g) => {
    const rows = byGroup[g];
    if (!rows.length) return '';
    const rowsHtml = rows.map((row) => `
      <tr>
        <td>${esc(row.activity)}${row.specificDay ? `<div style="font-size:11.5px; color:var(--text-faint); margin-top:2px">${esc(row.specificDay)}</div>` : ''}</td>
        <td><span class="chip">${esc(row.frequency)}</span></td>
        <td style="color:var(--text-secondary)">${row.workType ? esc(row.workType) : '—'}</td>
        <td>${row.focus ? `<span class="chip">${esc(row.focus)}</span>` : '—'}</td>
        <td style="color:var(--text-dim)">${esc(row.description || '')}</td>
      </tr>`).join('');
    return `
      <div class="section-head"><span class="running-head">${esc(g)} cadence</span></div>
      <div class="table-wrap"><div class="table-scroll">
        <table class="dt">
          <thead><tr><th style="min-width:200px">Activity</th><th style="width:100px">Frequency</th><th style="width:120px">Work type</th><th style="width:110px">Focus</th><th>Description</th></tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div></div>`;
  }).join('');

  const timeModel = lsw.timeAllocationModel;
  const timeHtml = (timeModel && timeModel.buckets && timeModel.buckets.length)
    ? `
      <div class="section-head"><span class="running-head">Time allocation model</span></div>
      <section class="card card--pad">
        ${timeModel.note ? `<p style="margin:0 0 12px; font-size:13px; color:var(--text-dim)">${esc(timeModel.note)}</p>` : ''}
        <div style="display:flex; gap:24px; flex-wrap:wrap">
          ${timeModel.buckets.map((b) => `
            <div>
              <div style="font-family:var(--font-serif); font-size:22px; font-weight:600; color:var(--text)">${Math.round(b.pct * 100)}%</div>
              <div style="font-size:12.5px; color:var(--text-dim)">${esc(b.label)}${b.illustrative ? ' <span class="chip" title="Illustrative — placeholder, not a live tracked number">illustrative</span>' : ''}</div>
            </div>`).join('')}
        </div>
      </section>`
    : '';

  return `
    <div class="page-head">
      <div>
        <span class="running-head page-head__eyebrow">Standard Work · LSW</span>
        <h1 style="font-size:24px; max-width:30ch">${esc(lsw.title)}</h1>
      </div>
      <div class="page-head__side">
        <button class="btn btn--secondary" data-back-to-library>Back to Library</button>
      </div>
    </div>

    <section class="card card--pad" style="margin-bottom:24px">
      <span class="running-head">Overview</span>
      <p style="margin:8px 0 16px; font-size:13.5px; line-height:1.6; color:var(--text-secondary); max-width:100ch">${esc(lsw.note || '')}</p>
      <span class="running-head">Source &amp; roles</span>
      <p style="margin:8px 0 0; font-size:13.5px; line-height:1.6; color:var(--text-secondary); max-width:100ch">${esc(lsw.source || '—')} · Roles: ${esc((lsw.roles || []).join(', ') || '—')}</p>
    </section>

    ${groupsHtml}
    ${timeHtml}`;
}

// ─── F. Data loading ─────────────────────────────────────────────────────────

async function loadLibData() {
  if (_libData) return _libData;
  try {
    const res = await fetch('data/sop-library.json');
    _libData = await res.json();
  } catch (e) {
    console.warn('Could not load sop-library.json:', e);
    _libData = null;
  }
  return _libData;
}

// ─── Public entry point ───────────────────────────────────────────────────────

/**
 * renderStandardWork(dept, mount)
 *
 * @param {object} dept   — department data object
 * @param {Element} mount — DOM element to render into
 */
async function renderStandardWork(dept, mount) {
  const state = {
    activeSopId: null,
    filterText: '',
    sopObjects: [],
    deptLib: null,
  };

  mount.innerHTML = `<p style="padding:24px 0; color:var(--text-faint)">Loading standard work…</p>`;

  // Load this department's full-content SOPs.
  const sopPaths = DEPT_SOPS[dept.id] || [];
  for (const path of sopPaths) {
    if (!_sopCache[path]) {
      try {
        const res = await fetch(path);
        _sopCache[path] = await res.json();
      } catch (e) {
        console.warn('Could not load SOP:', path, e);
      }
    }
    if (_sopCache[path]) state.sopObjects.push(_sopCache[path]);
  }

  // Load the shared library index.
  const libData = await loadLibData();
  state.deptLib = (libData && libData.departments && libData.departments[dept.id]) || null;

  // `?sop=<id>` deep-link (see app.js's documented hash-param vocabulary) —
  // pre-opens the matching embedded SOP's detail view if it's real for this
  // department; otherwise falls through to the library, same as no param.
  const hashQuery = location.hash.includes('?') ? location.hash.split('?')[1] : '';
  const preselectSopId = new URLSearchParams(hashQuery).get('sop');
  if (preselectSopId && state.sopObjects.some((s) => s.id === preselectSopId)) {
    state.activeSopId = preselectSopId;
  }

  function paint() {
    const prevInput = mount.querySelector('#sw-search');
    const hadFocus = !!prevInput && document.activeElement === prevInput;
    const selStart = hadFocus ? prevInput.selectionStart : null;

    const sop = state.activeSopId ? state.sopObjects.find((s) => s.id === state.activeSopId) : null;
    mount.innerHTML = state.activeSopId
      ? (sop ? sopDetailHTML(sop) : `<p style="padding:24px 0; color:var(--text-faint)">SOP "${esc(state.activeSopId)}" not found.</p>`)
      : libraryHTML(dept, state);

    if (hadFocus) {
      const inp = mount.querySelector('#sw-search');
      if (inp) {
        inp.focus();
        try { inp.setSelectionRange(selStart, selStart); } catch { /* no-op */ }
      }
    }
  }

  mount.addEventListener('click', (e) => {
    const backBtn = e.target.closest('[data-back-to-library]');
    if (backBtn) { state.activeSopId = null; paint(); return; }

    const openBtn = e.target.closest('[data-open-sop]');
    if (openBtn) {
      const id = openBtn.dataset.openSop;
      if (!id) return; // guard — an embedded SOP object missing a real id
      state.activeSopId = id;
      paint();
    }
  });

  // Keyboard activation for the `role="button"` featured SOP card(s).
  mount.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('[data-open-sop][role="button"]');
    if (card) { e.preventDefault(); card.click(); }
  });

  mount.addEventListener('input', (e) => {
    if (e.target && e.target.id === 'sw-search') {
      state.filterText = e.target.value;
      paint();
    }
  });

  paint();
}

;return { renderStandardWork };
})();

/* ==== views/teamboard-location.js ==== */
__M["views/teamboard-location.js"] = (function(){
/**
 * views/teamboard-location.js — KPI Boards, location model (Operations · Mechanism B)
 *
 * renderLocationBoard(dept, mount)   — unchanged public signature; app.js calls this
 *                                       only for dept.id === 'operations'.
 *
 * Layout ported from docs/redesign/reference/view-kpi.js (§5.2 DESIGN-GUIDE) — the
 * `.dt`-table KPI-board idiom (caret expander, `.status-cell`, `.chip` source/entry
 * tags, `sparkline`/`lineChart` trends, category-band rows) — wired to OUR data
 * throughout (lib/registry.js, lib/rag.js, lib/explain.js, dept.kpis,
 * dept.locationBoards) instead of the reference's single global DATA object. The
 * Hoshin strip + `H<n>` chips come from views/hoshin.js (Task 9), fed by
 * lib/hoshin.js's loadHoshin() the same fire-and-forget way views/hoshin.js's own
 * renderHoshin() loads it — this view paints synchronously without the strip, then
 * repaints once data/hoshin.json resolves (graceful null handling).
 *
 * Two sub-views selected by the LOCATION `.seg`:
 *   'we'      — the COO-board main KPIs (otp/pplh/materials), Mechanism B: WE Main is
 *               entered independently, not summed/averaged from the location subs.
 *               An adaptive chart card sits above the table (`.seg` KPI switcher):
 *               OTP has real weekly per-location series (`kpi.weeklyActuals`) so it
 *               renders as a multi-line chart with the location(s) whose computed RAG
 *               is red emphasized in `VIZ.rust` (data-driven "story location"
 *               detection — never a hardcoded "Mexico", even though Mexico is the
 *               only location that currently qualifies); PPLH/Materials have only a
 *               flat WE-level `kpi.series`, so they render single-series with no
 *               legend per §4.
 *   <location> — the location's own real FMDS board (dept.locationBoards[id]) —
 *               different KPI set/category taxonomy per location, category-band rows,
 *               `manual`/`formula` chips (derived from the KPI's real `rollup.
 *               isManualRekey`/contribution `entryType` fields — the legacy `k.rekey`/
 *               `k.formula` fields this file used to key off never exist in
 *               data/operations.json, so those chips silently never rendered before;
 *               fixed here to read the fields that actually exist), and expandable
 *               operator/line `contributions`, `subLines`, `byBuilding`, and
 *               `supervisors` (SRR) sub-rows — whichever of those four the KPI
 *               actually carries; sections with none of them render no caret at all.
 *
 * Zero-invented-data notes:
 *   - LOCATION tabs + labels come from dept.locations/dept.noDataLocations (not a
 *     hardcoded list) — a display-label map is the only local lookup, since the
 *     source JSON has no id→label field.
 *   - The "expand <KPI> for operator and line contributions" sub-head lists every
 *     main KPI that actually has `.contributors` (otp, pplh, AND materials in our
 *     data — the reference's own hardcoded example only names OTP/PPLH because its
 *     sample DATA only wired two).
 *   - hou_quality_external_remakes carries a real `actualUnit: "count"` distinct
 *     from its `unit: "rate"` target — the old code formatted the actual with the
 *     target's unit (showing an absurd "260200.0%"); fixed to prefer `actualUnit`
 *     for the actual-value cell, a field that already existed in source and was
 *     simply never read.
 *   - Per-KPI notes on expand prefer the KPI's own real fields (`note`/`unitNote`/
 *     `flagDetail`/`flag`/`nodataNote`/`rollup.note`) in that order; only when a KPI
 *     carries none of them does lib/explain.js's `explainKpi(...).why` (RAG-grounded,
 *     still real — never templated filler beyond "actual vs target") fill the gap, so
 *     every KPI stays click-in-able the way this board always has been.
 *   - The OTP row's dedicated red-bordered "T3 story" card only renders the fields
 *     `kpi.story` actually carries (title/denominatorNote/backlogNote/mechanismNote).
 */

const { mains, byId } = __M["lib/registry.js"];
const { ragStatus } = __M["lib/rag.js"];
const { explainKpi } = __M["lib/explain.js"];
const { lineChart, sparkline, wireChartHover, meter, VIZ } = __M["lib/charts.js"];
const { hoshinStrip, hoshinChips, wireHoshinStrip } = __M["views/hoshin.js"];
const { loadHoshin } = __M["lib/hoshin.js"];

// ─── Small shared helpers ───────────────────────────────────────────────────

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function joinWithAnd(strs) {
  if (!strs.length) return '';
  if (strs.length === 1) return strs[0];
  if (strs.length === 2) return strs.join(' and ');
  return strs.slice(0, -1).join(', ') + ' and ' + strs[strs.length - 1];
}

function joinWithOr(strs) {
  if (!strs.length) return '';
  if (strs.length === 1) return strs[0];
  if (strs.length === 2) return strs.join(' or ');
  return strs.slice(0, -1).join(', ') + ' or ' + strs[strs.length - 1];
}

// Right-chevron; `.kpi-name__caret.is-open` rotates it 90° to point down.
const CARET_SVG = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 3l5 5-5 5"/></svg>';

// ─── Location labels (display-only — ids/membership come from dept.locations /
//     dept.noDataLocations, the real fields; this is just id → human label) ──

const LOCATION_LABELS = {
  mexico: 'Mexico', norcross: 'Norcross', houston: 'Houston', canada: 'Canada',
  dr: 'Dominican Republic', hpi: 'HPI',
};

function locLabel(id) {
  if (!id) return id;
  return LOCATION_LABELS[id] || (id.charAt(0).toUpperCase() + id.slice(1));
}

function activeLocations(dept) {
  return (dept.locations || []).map((id) => ({ id, label: locLabel(id) }));
}

function noDataLocations(dept) {
  return (dept.noDataLocations || []).map((id) => ({ id, label: locLabel(id) }));
}

// ─── Value formatting ────────────────────────────────────────────────────────

function formatVal(v, unit) {
  if (v == null) return '—';
  if (typeof v !== 'number') return String(v);
  if (unit && (unit.startsWith('$') || unit.includes('$'))) {
    if (Math.abs(v) >= 1_000_000) return '$' + (v / 1_000_000).toFixed(2) + 'M';
    if (Math.abs(v) >= 1_000)     return '$' + (v / 1_000).toFixed(0) + 'k';
    return '$' + v.toLocaleString();
  }
  if (unit === 'ratio' || unit === 'percent' || unit === '%' || unit === 'pct') {
    return (v * 100).toFixed(1) + '%';
  }
  if (Math.abs(v) >= 1_000_000) return (v / 1_000_000).toFixed(2) + 'M';
  if (Math.abs(v) >= 1_000)     return (v / 1_000).toFixed(0) + 'k';
  return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

/**
 * Format a value from a locationBoard KPI according to its unit/targetType.
 * See formatVal's header note in the old file for the per-unit rationale —
 * unchanged from before this rebuild.
 */
function formatLocVal(v, unit, targetType) {
  if (v == null) return '—';
  if (typeof v !== 'number') return String(v);
  const u = unit || targetType || '';
  if (u === 'ratio' || u === 'rate' || u === 'percent' || u === '%' || u === 'pct') {
    return (v * 100).toFixed(1) + '%';
  }
  if (u === 'pcs_per_labor_hour') return v.toFixed(3) + ' pcs/hr';
  if (u === 'aggregate_labor_hours') return v.toFixed(1) + ' hrs';
  if (u === 'count') return Math.round(v).toLocaleString();
  if (u === 'not_set') return '—';
  if (Math.abs(v) >= 1_000_000) return (v / 1_000_000).toFixed(2) + 'M';
  if (Math.abs(v) >= 1_000)     return v.toLocaleString(undefined, { maximumFractionDigits: 1 });
  return v.toLocaleString(undefined, { maximumFractionDigits: 3 });
}

// ─── Status cell / chips ─────────────────────────────────────────────────────

function statusCell(rag) {
  const label = { green: 'On Track', amber: 'At Risk', red: 'Off Track', nodata: 'No Data' }[rag] || 'No Data';
  return `<span class="status-cell status-cell--${rag}"><span class="dot"></span>${label}</span>`;
}

/** Target-source `.chip` — plain mono chip per §3; the manual/no-source-system
 *  distinction lives in the tooltip, not a borrowed status hue. */
function sourceChip(kpi) {
  const ts = kpi.targetSource || kpi.source;
  if (!ts) return '';
  const label = ts.split(' / ')[0];
  return `<span class="chip" title="${esc(ts)}">${esc(label)}</span>`;
}

/** WE-main sub-row source chip — derives the real entry-method word ("hand-keyed",
 *  "literal", …) from the sub's own `source` field instead of hardcoding it. */
function subSourceChip(sub) {
  if (!sub.source) return '';
  const parts = sub.source.split(' / ');
  const label = parts.length > 1 ? parts[parts.length - 1] : parts[0];
  return `<span class="chip" title="${esc(sub.source)}">${esc(label)}</span>`;
}

/** manual/formula `.chip` — sage-tinted variant for formula, matching the
 *  reference's own inline-style treatment (no new CSS class needed). */
function entryChip(kind) {
  if (kind === 'formula') {
    return `<span class="chip" style="border-color:hsl(var(--action-4));background:hsl(var(--action-1));color:var(--accent-text)" title="Computed by in-sheet formula">formula</span>`;
  }
  if (kind === 'manual') {
    return `<span class="chip" title="Hand-keyed literal">manual</span>`;
  }
  return '';
}

// ─── Monthly-series sparkline (shared by WE-main .note fallback + loc boards) ─

const MONTH_ORDER = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function monthlySeries(monthlyActuals) {
  const keys = Object.keys(monthlyActuals || {});
  const order = MONTH_ORDER.filter((m) => keys.includes(m) || keys.includes(m.toLowerCase()));
  const values = order.map((m) => {
    const v = monthlyActuals[m] != null ? monthlyActuals[m] : monthlyActuals[m.toLowerCase()];
    return typeof v === 'number' ? v : null;
  });
  const labels = order.map((m) => m[0] + m.slice(1).toLowerCase());
  return { values, labels };
}

function monthSparklineSvg(monthlyActuals, target, name, unit) {
  const { values, labels } = monthlySeries(monthlyActuals);
  if (values.filter((v) => v != null).length < 2) return '';
  return sparkline(values, { w: 132, h: 34, target, name, labels, fmt: unit });
}

// ─── Deep-link hash params (read-once on mount, matching the `?kpi=&kz=`
//     pattern views/problemsolving.js already uses) ──────────────────────────

function currentHashParams() {
  const hashQuery = location.hash.includes('?') ? location.hash.split('?')[1] : '';
  return new URLSearchParams(hashQuery);
}

// ─── Per-KPI "why" notes on expand ───────────────────────────────────────────

function weMainNoteLines(kpi, dept, rag) {
  // OTP's dedicated red-bordered story card already carries this narrative —
  // don't restate it a second time in the row's own flag-note.
  if (kpi.story) return [];
  const lines = [];
  if (kpi.note) lines.push(kpi.note);
  if (!lines.length) {
    const why = explainKpi(kpi, dept, { rag }).why;
    if (why) lines.push(why);
  }
  return lines;
}

function locNoteLines(kpi, dept, rag) {
  const lines = [];
  if (kpi.unitNote) lines.push(kpi.unitNote);
  if (kpi.flagDetail) lines.push(kpi.flagDetail);
  else if (kpi.flag && typeof kpi.flag === 'string') lines.push(kpi.flag);
  if (kpi.nodataNote) lines.push(kpi.nodataNote);
  if (kpi.rollup && kpi.rollup.note) lines.push(kpi.rollup.note);
  if (!lines.length) {
    const why = explainKpi(kpi, dept, { rag }).why;
    if (why) lines.push(why);
  }
  return lines;
}

// ─── WE Main (COO board) — rows ──────────────────────────────────────────────

function weMainSubRow(dept, mainKpi, sub) {
  const isNoData = sub.nodata || sub.actual == null;
  const rag = isNoData ? 'nodata' : ragStatus(sub.actual, mainKpi.target, mainKpi.direction || 'higher_better');
  const label = locLabel(sub.location) || sub.name;
  const series = sub.series || [];
  const spark = series.length
    ? sparkline(series, { w: 132, h: 34, target: mainKpi.target, name: `${label} ${mainKpi.name}`, labels: series.map((_, i) => 'Wk ' + (i + 1)), fmt: mainKpi.unit })
    : '';
  return `
    <tr class="kpi-sub">
      <td>${esc(label)}${sub.flag ? `<div class="kpi-flag-note" style="margin-left:0">${esc(sub.flag)}</div>` : ''}</td>
      <td class="num">${formatVal(mainKpi.target, mainKpi.unit)}</td>
      <td class="num">${isNoData ? '—' : formatVal(sub.actual, mainKpi.unit)}</td>
      <td>${statusCell(rag)}</td>
      <td>${subSourceChip(sub)}</td>
      <td>${spark}</td>
    </tr>`;
}

function weMainRow(dept, kpi, hoshin, expandedIds) {
  const isExpanded = expandedIds.has(kpi.id);
  const isNoData = kpi.actual == null;
  const rag = isNoData ? 'nodata' : ragStatus(kpi.actual, kpi.target, kpi.direction || 'higher_better');
  const mechChip = kpi.rollupMethod === 'independent'
    ? `<span class="chip" title="${esc(dept.mechanismNote || '')}">Mechanism B</span>`
    : '';
  const hchips = hoshin ? hoshinChips(hoshin, dept) : '';
  const series = kpi.series || [];
  const spark = series.length
    ? sparkline(series, { w: 132, h: 34, target: kpi.target, name: kpi.name + ' trend', labels: series.map((_, i) => 'Wk ' + (i + 1)), fmt: kpi.unit })
    : '';

  let rows = `
    <tr class="kpi-row">
      <td>
        <div class="kpi-name">
          <button class="kpi-name__caret ${isExpanded ? 'is-open' : ''}" data-row="${kpi.id}" aria-expanded="${isExpanded}" aria-label="Expand ${esc(kpi.name)}">${CARET_SVG}</button>
          ${esc(kpi.name)}
          ${mechChip}
          ${hchips}
        </div>
        ${isExpanded ? weMainNoteLines(kpi, dept, rag).map((n) => `<div class="kpi-flag-note">${esc(n)}</div>`).join('') : ''}
      </td>
      <td class="num">${formatVal(kpi.target, kpi.unit)}</td>
      <td class="num" style="font-weight:600">${isNoData ? '—' : formatVal(kpi.actual, kpi.unit)}</td>
      <td>${statusCell(rag)}</td>
      <td>${sourceChip(kpi)}</td>
      <td>${spark}</td>
    </tr>`;

  if (isExpanded) {
    const subs = (kpi.contributors || []).map((cid) => byId(dept, cid)).filter(Boolean);
    rows += subs.map((sub) => weMainSubRow(dept, kpi, sub)).join('');
  }
  return rows;
}

// ─── OTP "T3 story" card ─────────────────────────────────────────────────────

function storyPanelHTML(story) {
  if (!story) return '';
  const fields = [
    story.denominatorNote ? ['Denominator', story.denominatorNote] : null,
    story.backlogNote ? ['Backlog', story.backlogNote] : null,
    story.mechanismNote ? ['Mechanism', story.mechanismNote] : null,
  ].filter(Boolean);
  if (!fields.length) return '';
  return `
    <section class="card card--pad" style="margin-top:16px; border-left:3px solid var(--red)">
      <span class="running-head">${esc(story.title || 'Context story')}</span>
      <div class="field-list" style="margin-top:12px; grid-template-columns:repeat(auto-fit,minmax(260px,1fr))">
        ${fields.map(([label, value]) => `<div class="field"><span class="field__label">${esc(label)}</span><span class="field__value">${esc(value)}</span></div>`).join('')}
      </div>
    </section>`;
}

// ─── Adaptive chart card (WE Main) ───────────────────────────────────────────

/** Contributor subs whose computed RAG is red — the data-driven "drag" set
 *  (only ever Mexico today, but never hardcoded as such). */
function dragSubsFor(dept, kpi) {
  if (!(kpi.weeklyActuals && kpi.weeklyActuals.weeks)) return [];
  const subs = (kpi.contributors || []).map((cid) => byId(dept, cid)).filter(Boolean);
  return subs.filter((s) => !s.nodata && s.actual != null &&
    ragStatus(s.actual, kpi.target, kpi.direction || 'higher_better') === 'red');
}

function chartMetaFor(dept, kpi) {
  const isMulti = !!(kpi.weeklyActuals && kpi.weeklyActuals.weeks);
  if (isMulti) {
    const weeks = kpi.weeklyActuals.weeks;
    const title = `${kpi.name} by location — weekly, weeks ${weeks[0]}–${weeks[weeks.length - 1]}`;
    const subs = (kpi.contributors || []).map((cid) => byId(dept, cid)).filter(Boolean);
    const dragSubs = dragSubsFor(dept, kpi);
    const dragIds = new Set(dragSubs.map((s) => s.location));
    const nearSubs = subs.filter((s) => !dragIds.has(s.location) && !s.nodata && s.actual != null);
    let sub;
    if (dragSubs.length) {
      const dragNames = dragSubs.map((s) => locLabel(s.location));
      const nearNames = nearSubs.map((s) => locLabel(s.location));
      sub = `${joinWithAnd(dragNames)} ${dragNames.length > 1 ? 'are' : 'is'} the drag on the WE main.`
        + (nearNames.length ? ` ${joinWithAnd(nearNames)} hold near target.` : '');
    } else {
      sub = 'All active locations report within range of target.';
    }
    return { title, sub, isMulti: true, dragIds };
  }
  const series = kpi.series || [];
  return {
    title: `${kpi.name} — weekly, weeks 1–${series.length}`,
    sub: kpi.note || `${kpi.direction === 'lower_better' ? 'Lower is better.' : 'Higher is better.'} Target ${formatVal(kpi.target, kpi.unit)}.`,
    isMulti: false,
  };
}

function weMainChartSvg(kpi, meta) {
  const isRatio = kpi.unit === 'ratio';
  const fmtY = isRatio ? (v) => Math.round(v * 100) + '%' : (v) => v.toFixed(0);
  if (meta.isMulti) {
    const weeks = kpi.weeklyActuals.weeks;
    const locKeys = Object.keys(kpi.weeklyActuals).filter((k) => k !== 'weeks');
    const rank = (k) => (k === 'we' ? 1 : meta.dragIds.has(k) ? 2 : 0);
    const ordered = locKeys.slice().sort((a, b) => rank(a) - rank(b));
    const series = ordered.map((locKey) => {
      const isWe = locKey === 'we';
      const isDrag = meta.dragIds.has(locKey);
      return {
        name: isWe ? 'WE Main' : locLabel(locKey),
        data: kpi.weeklyActuals[locKey],
        color: isWe ? VIZ.single : isDrag ? VIZ.rust : VIZ.contextLine,
        soft: isDrag ? VIZ.rustSoft : undefined,
        emphasis: isDrag,
      };
    });
    return lineChart({
      w: 900, h: 280, target: kpi.target, fmt: kpi.unit, fmtY,
      label: `Weekly ${kpi.name} by location`,
      xLabels: weeks.map((w) => 'Wk ' + w),
      series,
    });
  }
  return lineChart({
    w: 900, h: 240, target: kpi.target, fmt: kpi.unit, fmtY,
    label: kpi.name + ' weekly actual vs target',
    xLabels: (kpi.series || []).map((_, i) => 'Wk ' + (i + 1)),
    series: [{ name: 'WE Main', data: kpi.series || [], color: VIZ.single, soft: VIZ.singleSoft, emphasis: true }],
  });
}

function chartLegendHTML(meta, kpi) {
  if (!meta.isMulti) return '';
  const items = [];
  [...meta.dragIds].forEach((id) => {
    items.push(`<span class="legend__item"><span class="legend__line" style="background:${VIZ.rust}"></span>${esc(locLabel(id))}</span>`);
  });
  items.push(`<span class="legend__item"><span class="legend__line" style="background:${VIZ.single}"></span>WE Main</span>`);
  const otherCount = Object.keys(kpi.weeklyActuals).filter((k) => k !== 'weeks' && k !== 'we' && !meta.dragIds.has(k)).length;
  if (otherCount) items.push(`<span class="legend__item"><span class="legend__line" style="background:${VIZ.contextLine}"></span>Other locations</span>`);
  return `<div class="legend">${items.join('')}</div>`;
}

function chartKpiSegHTML(kpiList, selectedId) {
  const items = kpiList.map((k) => {
    const label = k.name.split(' (')[0];
    return `<button class="seg__item ${selectedId === k.id ? 'is-on' : ''}" data-chart-kpi="${k.id}">${esc(label)}</button>`;
  }).join('');
  return `<div class="seg" role="tablist" aria-label="Chart KPI">${items}</div>`;
}

// ─── WE Main section (chart card + table) ────────────────────────────────────

function weMainSectionHTML(dept, hoshin, state) {
  const allMains = mains(dept);
  const selKpi = byId(dept, state.chartKpi) || allMains[0];

  const chartHtml = selKpi ? (() => {
    const meta = chartMetaFor(dept, selKpi);
    const svg = weMainChartSvg(selKpi, meta);
    const legend = chartLegendHTML(meta, selKpi);
    return `
    <section class="card" style="margin-bottom:24px">
      <div style="padding:24px 24px 8px; display:flex; justify-content:space-between; gap:16px; align-items:flex-start; flex-wrap:wrap">
        <div style="min-width:260px; flex:1">
          <h3>${esc(meta.title)}</h3>
          <p class="page-head__sub" style="margin-top:4px; max-width:72ch">${esc(meta.sub)}</p>
        </div>
        <div style="display:flex; flex-direction:column; align-items:flex-end; gap:10px">
          ${chartKpiSegHTML(allMains, selKpi.id)}
          ${legend}
        </div>
      </div>
      <div style="padding:0 24px 20px">${svg}</div>
    </section>`;
  })() : '';

  const tableKpis = state.filterText
    ? allMains.filter((k) => k.name.toLowerCase().includes(state.filterText.toLowerCase()))
    : allMains;

  const rowsHtml = tableKpis.length
    ? tableKpis.map((k) => weMainRow(dept, k, hoshin, state.expandedIds)).join('')
    : `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-faint)">No KPIs match "${esc(state.filterText)}"</td></tr>`;

  const storyKpi = allMains.find((k) => k.story && state.expandedIds.has(k.id));

  return `
  ${chartHtml}
  <div class="table-wrap"><div class="table-scroll">
    <table class="dt">
      <thead><tr>
        <th style="min-width:340px">KPI</th><th class="num">Target</th><th class="num">Actual</th>
        <th>Status</th><th>Target source</th><th>Trend</th>
      </tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  </div></div>
  ${storyKpi ? storyPanelHTML(storyKpi.story) : ''}
  <p class="board-hint"><b>WE Main</b> is entered independently on the COO Board (${esc(dept.mechanismNote || 'Mechanism B')}). <b>Location tabs</b> open each per-location FMDS board — real KPI sets differ by location. <span class="chip">hand-keyed</span> marks a manual literal; a sage-tinted <span class="chip" style="border-color:hsl(var(--action-4));background:hsl(var(--action-1));color:var(--accent-text)">formula</span> chip marks a computed roll-up. Click a row's caret to expand.</p>`;
}

// ─── Per-location FMDS board ──────────────────────────────────────────────────

function locSummaryStripHTML(locBoard) {
  const lines = locBoard.productionLines || [];
  return `
    <section class="loc-note" style="margin-bottom:16px">
      <span class="loc-note__stat"><b>${esc(locBoard.label)}</b> FMDS board</span>
      <span class="loc-note__stat"><b>${locBoard.kpiCount}</b> KPI column-pairs in source</span>
      <span class="loc-note__stat"><b>${lines.length}</b> production line${lines.length === 1 ? '' : 's'}</span>
      ${locBoard.buildings != null ? `<span class="loc-note__stat"><b>${locBoard.buildings}</b> building${locBoard.buildings > 1 ? 's' : ''}</span>` : ''}
      ${locBoard.weeklyLabel === 'DAYS' ? '<span class="badge badge--neutral">Cadence: DAYS</span>' : ''}
      ${lines.length ? `<span class="loc-note__stat faint" style="flex-basis:100%; font-size:12.5px">Lines: ${esc(lines.join(' · '))}</span>` : ''}
      ${locBoard.actualsNote ? `<span class="loc-note__stat faint" style="flex-basis:100%; font-size:12.5px">${esc(locBoard.actualsNote)}</span>` : ''}
    </section>`;
}

function lastNonNull(obj) {
  if (!obj) return null;
  const vals = Object.values(obj).filter((v) => typeof v === 'number');
  return vals.length ? vals[vals.length - 1] : null;
}

function genericSubRowHTML(kpi, label, target, actual) {
  const hasVal = actual != null;
  const rag = hasVal && target != null ? ragStatus(actual, target, kpi.direction || 'higher_better') : 'nodata';
  return `
    <tr class="kpi-sub">
      <td>${esc(label)}</td>
      <td class="num">${target == null ? '—' : formatLocVal(target, kpi.unit, kpi.targetType)}</td>
      <td class="num">${hasVal ? formatLocVal(actual, kpi.unit, kpi.targetType) : '—'}</td>
      <td>${statusCell(rag)}</td>
      <td></td>
      <td></td>
    </tr>`;
}

function contribRowHTML(kpi, c) {
  const hasVal = c.value != null;
  const rag = hasVal && c.target != null ? ragStatus(c.value, c.target, kpi.direction || 'higher_better') : 'nodata';
  const ownerHtml = c.owner ? ` <span class="faint" style="font-size:11px">${esc(c.owner)}</span>` : '';
  const spark = c.monthlyActuals ? monthSparklineSvg(c.monthlyActuals, c.target, `${c.label} monthly`, c.unit || kpi.unit) : '';
  return `
    <tr class="kpi-sub">
      <td>${esc(c.label)} ${entryChip(c.entryType)}${ownerHtml}</td>
      <td class="num">${c.target != null ? formatLocVal(c.target, c.unit || kpi.unit, kpi.targetType) : '—'}</td>
      <td class="num">${hasVal ? formatLocVal(c.value, c.unit || kpi.unit, kpi.targetType) : '—'}</td>
      <td>${statusCell(rag)}</td>
      <td></td>
      <td>${spark}</td>
    </tr>`;
}

function supervisorRowHTML(kpi, p) {
  const hasVal = p.actual != null;
  const target = p.target != null ? p.target : kpi.target;
  const rag = hasVal && target != null ? ragStatus(p.actual, target, kpi.direction || 'higher_better') : 'nodata';
  const tone = rag === 'green' ? 'green' : rag === 'amber' ? 'amber' : 'red';
  return `
    <tr class="kpi-sub">
      <td>${esc(p.name)} <span class="faint" style="font-weight:400">· ${esc(p.role || '')}</span></td>
      <td class="num">${target != null ? formatLocVal(target, kpi.unit, kpi.targetType) : '—'}</td>
      <td class="num">${hasVal ? formatLocVal(p.actual, kpi.unit, kpi.targetType) : '—'}</td>
      <td>${statusCell(rag)}</td>
      <td></td>
      <td style="min-width:120px">${hasVal && target != null ? meter(Math.min(p.actual / target, 1), tone) : ''}</td>
    </tr>`;
}

/** Expandable sub-rows for a per-location KPI — whichever of these four real
 *  shapes the KPI actually carries (never more than one is populated). */
function subRowsForLocKpi(kpi) {
  if (Array.isArray(kpi.contributions) && kpi.contributions.length) {
    return kpi.contributions.map((c) => contribRowHTML(kpi, c)).join('');
  }
  if (Array.isArray(kpi.subLines) && kpi.subLines.length) {
    return kpi.subLines.map((s) => genericSubRowHTML(kpi, s.line, s.target, lastNonNull(s.monthlyActuals))).join('');
  }
  if (Array.isArray(kpi.byBuilding) && kpi.byBuilding.length) {
    return kpi.byBuilding.map((b) => genericSubRowHTML(kpi, `Building ${b.building}`, b.target, b.actual)).join('');
  }
  if (Array.isArray(kpi.supervisors) && kpi.supervisors.length) {
    return kpi.supervisors.map((p) => supervisorRowHTML(kpi, p)).join('');
  }
  return '';
}

function hasSubRows(kpi) {
  return (Array.isArray(kpi.contributions) && kpi.contributions.length > 0)
    || (Array.isArray(kpi.subLines) && kpi.subLines.length > 0)
    || (Array.isArray(kpi.byBuilding) && kpi.byBuilding.length > 0)
    || (Array.isArray(kpi.supervisors) && kpi.supervisors.length > 0);
}

function locRowHTML(dept, kpi, expandedLocIds) {
  const isNoData = kpi.nodata || kpi.actual == null;
  const unitMismatch = kpi.flag && String(kpi.flag).startsWith('unit_mismatch');
  const rag = (isNoData || unitMismatch) ? 'nodata' : ragStatus(kpi.actual, kpi.target, kpi.direction || 'higher_better');
  const isExpanded = expandedLocIds.has(kpi.id);
  const entryKind = kpi.rollup ? (kpi.rollup.isManualRekey ? 'manual' : 'formula') : null;
  const spark = kpi.monthlyActuals ? monthSparklineSvg(kpi.monthlyActuals, kpi.target, kpi.name + ' monthly', kpi.unit) : '';
  // hou_quality_external_remakes: target unit is 'rate', actual is a raw count
  // (real `actualUnit` field) — format the actual with its own real unit.
  const actualUnit = kpi.actualUnit || kpi.unit;

  let rows = `
    <tr class="kpi-row">
      <td>
        <div class="kpi-name">
          <button class="kpi-name__caret ${isExpanded ? 'is-open' : ''}" data-loc-row="${kpi.id}" aria-expanded="${isExpanded}" aria-label="Expand ${esc(kpi.name)}">${CARET_SVG}</button>
          ${esc(kpi.name)}
          ${entryKind ? entryChip(entryKind) : ''}
        </div>
        ${isExpanded ? locNoteLines(kpi, dept, rag).map((n) => `<div class="kpi-flag-note">${esc(n)}</div>`).join('') : ''}
      </td>
      <td class="num">${kpi.target == null ? '—' : formatLocVal(kpi.target, kpi.unit, kpi.targetType)}</td>
      <td class="num" style="font-weight:600">${isNoData ? '—' : formatLocVal(kpi.actual, actualUnit, kpi.targetType)}</td>
      <td>${statusCell(rag)}</td>
      <td>${sourceChip(kpi)}</td>
      <td>${spark}</td>
    </tr>`;

  if (isExpanded) rows += subRowsForLocKpi(kpi);
  return rows;
}

function buildLocRows(dept, kpis, expandedLocIds) {
  let currentCat = null;
  return kpis.map((k) => {
    const catRow = k.category !== currentCat
      ? `<tr class="kpi-cat"><td colspan="6"><span>${esc(k.category || '')}</span></td></tr>`
      : '';
    currentCat = k.category;
    return catRow + locRowHTML(dept, k, expandedLocIds);
  }).join('');
}

function locBoardSectionHTML(dept, locBoard, state) {
  if (!locBoard) {
    return `<div class="table-wrap"><div class="table-scroll"><table class="dt"><tbody>
      <tr><td style="text-align:center;padding:24px;color:var(--text-faint)">No per-location board data available.</td></tr>
    </tbody></table></div></div>`;
  }
  let kpis = locBoard.kpis || [];
  if (state.filterText) {
    const f = state.filterText.toLowerCase();
    kpis = kpis.filter((k) => k.name.toLowerCase().includes(f) || (k.category || '').toLowerCase().includes(f));
  }
  const rowsHtml = kpis.length
    ? buildLocRows(dept, kpis, state.expandedLocIds)
    : `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-faint)">No KPIs match "${esc(state.filterText)}"</td></tr>`;

  return `
  ${locSummaryStripHTML(locBoard)}
  <div class="table-wrap"><div class="table-scroll">
    <table class="dt">
      <thead><tr>
        <th style="min-width:320px">KPI</th><th class="num">Target</th><th class="num">Actual</th>
        <th>Status</th><th>Target source</th><th>Trend</th>
      </tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  </div></div>
  <p class="board-hint"><span class="chip">manual</span> = hand-keyed literal; <span class="chip" style="border-color:hsl(var(--action-4));background:hsl(var(--action-1));color:var(--accent-text)">formula</span> = computed by in-sheet formula. Click a caret to expand line contributions. Data flags are shown inside the expanded row.</p>`;
}

// ─── Location switcher ────────────────────────────────────────────────────────

function locationSegHTML(dept, state) {
  const items = [
    { id: 'we', label: 'WE Main' },
    ...activeLocations(dept),
    ...noDataLocations(dept).map((l) => ({ ...l, disabled: true })),
  ];
  return items.map((l) => `
    <button class="seg__item ${state.locationId === l.id ? 'is-on' : ''}" data-loc="${l.id}" ${l.disabled ? `disabled title="${esc(dept.noDataNote || 'No data')}"` : ''}>
      ${esc(l.label)}${l.disabled ? ' <span class="faint" style="font-size:10px">no data</span>' : ''}
    </button>`).join('');
}

// ─── Public entry point ───────────────────────────────────────────────────────

function renderLocationBoard(dept, mount) {
  const hashParams = currentHashParams();
  const allLocIds = new Set(['we', ...activeLocations(dept).map((l) => l.id)]);
  const mainList = mains(dept);

  const state = {
    locationId: allLocIds.has(hashParams.get('loc')) ? hashParams.get('loc') : 'we',
    chartKpi: mainList.some((k) => k.id === hashParams.get('chart')) ? hashParams.get('chart') : (mainList[0] ? mainList[0].id : null),
    filterText: '',
    expandedIds: new Set(),
    expandedLocIds: new Set(),
  };
  let hoshin = null;

  const expandableNames = mainList
    .filter((k) => k.contributors && k.contributors.length)
    .map((k) => k.name.split(' (')[0]);

  function fullHTML() {
    const hasLocBoard = state.locationId !== 'we' && dept.locationBoards && dept.locationBoards[state.locationId];
    const body = hasLocBoard
      ? locBoardSectionHTML(dept, dept.locationBoards[state.locationId], state)
      : weMainSectionHTML(dept, hoshin, state);

    return `
    <div class="page-head">
      <div>
        <span class="running-head page-head__eyebrow">${esc(dept.name)} · Mechanism B</span>
        <h1>KPI Boards</h1>
        <p class="page-head__sub">L2 · ${esc(dept.lead || '')} · Location model — expand ${esc(joinWithOr(expandableNames))} for operator and line contributions</p>
      </div>
      <div class="page-head__side">
        <button class="btn btn--secondary" data-go="team">Back to Overview</button>
      </div>
    </div>

    ${hoshin ? hoshinStrip(hoshin, dept) : ''}

    <div class="flex" style="align-items:center; gap:16px; flex-wrap:wrap; margin:24px 0">
      <span class="running-head">Location</span>
      <div class="seg" role="tablist" aria-label="Location">${locationSegHTML(dept, state)}</div>
      <div style="flex:1"></div>
      <input class="input" id="lb-filter" style="max-width:220px" type="search" placeholder="Filter KPIs" aria-label="Filter KPIs" value="${esc(state.filterText)}">
    </div>

    <div id="loc-body">${body}</div>
    <div class="chart-tip" id="chart-tip"></div>`;
  }

  function paint() {
    const prevFilter = mount.querySelector('#lb-filter');
    const hadFocus = !!prevFilter && document.activeElement === prevFilter;
    const selStart = hadFocus ? prevFilter.selectionStart : null;

    mount.innerHTML = fullHTML();

    if (hadFocus) {
      const inp = mount.querySelector('#lb-filter');
      if (inp) {
        inp.focus();
        try { inp.setSelectionRange(selStart, selStart); } catch { /* no-op */ }
      }
    }
    const tip = mount.querySelector('#chart-tip');
    if (tip) wireChartHover(mount, tip);
  }

  mount.addEventListener('click', (e) => {
    const backBtn = e.target.closest('[data-go]');
    if (backBtn) { location.hash = `#/dept/${dept.id}/${backBtn.dataset.go}`; return; }

    const locBtn = e.target.closest('[data-loc]');
    if (locBtn) {
      state.locationId = locBtn.dataset.loc;
      state.expandedIds.clear();
      state.expandedLocIds.clear();
      paint();
      return;
    }

    const chartBtn = e.target.closest('[data-chart-kpi]');
    if (chartBtn) { state.chartKpi = chartBtn.dataset.chartKpi; paint(); return; }

    const rowBtn = e.target.closest('[data-row]');
    if (rowBtn) {
      const id = rowBtn.dataset.row;
      if (state.expandedIds.has(id)) state.expandedIds.delete(id); else state.expandedIds.add(id);
      paint();
      return;
    }

    const locRowBtn = e.target.closest('[data-loc-row]');
    if (locRowBtn) {
      const id = locRowBtn.dataset.locRow;
      if (state.expandedLocIds.has(id)) state.expandedLocIds.delete(id); else state.expandedLocIds.add(id);
      paint();
    }
  });

  mount.addEventListener('input', (e) => {
    if (e.target && e.target.id === 'lb-filter') {
      state.filterText = e.target.value;
      paint();
    }
  });

  wireHoshinStrip(mount);

  paint();

  loadHoshin().then((h) => {
    if (!h) return;
    hoshin = h;
    paint();
  });
}

;return { renderLocationBoard };
})();

/* ==== app.js ==== */
__M["app.js"] = (function(){
/**
 * app.js — hash router + store wiring for FMDS OS prototype
 *
 * Routes:
 *   #/                       → home (placeholder)
 *   #/dept/:id/:view         → one of: team | kpi | hoshin | my | solve | sop | sources | mark
 *
 * Left-rail views per department:
 *   Team Board      — always visible
 *   KPI             — always visible
 *   My Board        — only when dept.hasL1 === true
 *   Problem-Solving — always visible
 *   Standard Work   — always visible
 *
 * Deep-link params: our hash is path-based (#/dept/:id/:view), NOT the
 * reference's flat query-string scheme (#view=kpi&loc=...) — that stays the
 * router model. Extra deep-link data rides as a query string appended to the
 * view segment, e.g. "#/dept/operations/solve?kpi=rev_jc&kz=346" or
 * "#/dept/operations/kpi?loc=houston&chart=otp". route() only strips that
 * suffix to resolve the view id (`parts[2].split('?')[0]`) — it never
 * mutates `location.hash` itself, so the full query string survives
 * unmangled all the way to the rendered view. Each view is responsible for
 * reading the params it cares about off `location.hash` directly (the
 * pattern views/problemsolving.js and views/askmark.js already use for
 * `kpi`/`kz`). Full vocabulary this scheme supports, per the redesign spec:
 *   kpi, kz      — ALREADY consumed (problemsolving.js R3 handoff, askmark.js)
 *   loc, chart   — reserved for the KPI-board location/chart-switcher deep
 *                  link (Task 8/8b — teamboard-location.js etc.)
 *   step         — reserved for opening the 8-step A3 on a specific step
 *                  (Task 11 — problemsolving.js wizard)
 *   sop          — reserved for opening a specific Standard Work SOP detail
 *                  (Task 12 — standardwork.js)
 *   respond      — reserved for opening the Ask Mark response modal (Task 14
 *                  — askmark.js)
 * No app.js change is needed to "unlock" the reserved params — they already
 * pass through; the consuming views just don't parse them yet.
 */

const { createStore } = __M["lib/store.js"];
const { renderLocationBoard } = __M["views/teamboard-location.js"];
const { renderOverview } = __M["views/overview.js"];
const { renderHoshin } = __M["views/hoshin.js"];
const { renderOdgHub } = __M["views/odg-hub.js"];
const { renderKpi } = __M["views/kpi.js"];
const { renderMyBoard } = __M["views/myboard.js"];
const { renderMyDay } = __M["views/myday.js"];
const { renderProblemSolving } = __M["views/problemsolving.js"];
const { renderStandardWork } = __M["views/standardwork.js"];
const { renderSources } = __M["views/sources.js"];
const { renderAskMark } = __M["views/askmark.js"];
const { renderLogin, resolvePersona } = __M["views/login.js"];
const { redKpisNeedingResponse, getResponse } = __M["lib/accountability.js"];

const app   = document.getElementById('app');
const store = createStore({ departments: [], dept: null, session: null });

// ─── Boot: load departments index ──────────────────────────────────────────
async function boot() {
  try {
    const res   = await fetch('data/departments.json');
    const depts = await res.json();
    store.set({ departments: depts });
  } catch (err) {
    console.error('Failed to load departments.json', err);
  }
  route();
}

// Role-aware home view for a session
function homeViewFor(session) {
  return session.role === 'L1' ? 'my' : 'team';
}

// ─── Router ────────────────────────────────────────────────────────────────
async function route() {
  const hash  = location.hash.slice(1) || '/';
  const parts = hash.split('/').filter(Boolean); // e.g. ['dept','service','team']
  const session = store.get().session;

  // No session → login gate (always), except explicit #/login
  if (!session) {
    showLogin();
    return;
  }

  if (parts[0] === 'login') {
    showLogin();
    return;
  }

  if (parts[0] === 'dept' && parts[1]) {
    const deptId = parts[1];
    // Strip any ?query suffix from the view segment (e.g. "solve?kpi=rev_jc" → "solve")
    const view   = (parts[2] || homeViewFor(session)).split('?')[0];
    await loadDeptView(deptId, view);
  } else {
    // Authenticated but no route → send to the session's home
    location.hash = `#/dept/${session.deptId}/${homeViewFor(session)}`;
  }
}

// ─── Login gate ──────────────────────────────────────────────────────────────
function showLogin() {
  const departments = store.get().departments;
  if (!departments.length) {
    app.innerHTML = `<div class="container" style="padding-top:48px"><p class="text-muted">Loading…</p></div>`;
    return;
  }
  renderLogin(app, ({ deptId, role, persona }) => {
    store.set({ session: { deptId, role, persona } });
    const target = `#/dept/${deptId}/${role === 'L1' ? 'my' : 'team'}`;
    // If the hash won't change (already on target), route() won't fire via hashchange.
    if (location.hash === target) route();
    else location.hash = target;
  }, departments);
}

function signOut() {
  store.set({ session: null, dept: null });
  if (location.hash === '#/login') showLogin();
  else location.hash = '#/login';   // hashchange → route() → showLogin()
}

// ─── Load dept JSON + route to view ────────────────────────────────────────
async function loadDeptView(deptId, view) {
  let dept = store.get().deptCache?.[deptId];

  if (!dept) {
    try {
      const res = await fetch(`data/${deptId}.json`);
      if (!res.ok) throw new Error(`${res.status}`);
      dept = await res.json();
      // cache in store
      const cache = store.get().deptCache || {};
      cache[deptId] = dept;
      store.set({ dept, deptCache: cache });
    } catch (err) {
      app.innerHTML = `<div class="container" style="padding-top:48px">
        <p class="text-muted">Could not load data for <strong>${deptId}</strong>. (${err.message})</p>
        <a href="#/">← Home</a></div>`;
      return;
    }
  } else {
    store.set({ dept });
  }

  const departments = store.get().departments;
  const deptMeta    = departments.find(d => d.id === deptId) || {};

  // Merge hasL1 from departments index into dept object
  const deptFull = { ...dept, hasL1: deptMeta.hasL1 ?? false };

  renderLayout(deptFull, view);
}

// ─── SVG nav/topbar icons ───────────────────────────────────────────────────
// Ported from docs/redesign/reference/app.js's ICONS set (1.5px stroke,
// 16x16 viewBox, currentColor) — replaces the old single-character glyph
// icons per the redesign spec (no glyph nav icons).
const ICONS = {
  overview: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1.5" y="1.5" width="13" height="13" rx="2"/><path d="M1.5 6h13M6 6v9"/></svg>',
  kpi:      '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 13.5V9M6 13.5V5.5M10 13.5V8M14 13.5V3"/></svg>',
  hoshin:   '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="2.25"/></svg>',
  solve:    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 14V2.5M3 2.5h9.5l-2 3.5 2 3.5H3"/></svg>',
  sop:      '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 1.5h6.5L13.5 4.5V14.5h-9.5z"/><path d="M6 6.5h4M6 9h4M6 11.5h2.5"/></svg>',
  sources:  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="8" cy="3.5" rx="5.5" ry="2"/><path d="M2.5 3.5v9c0 1.1 2.5 2 5.5 2s5.5-.9 5.5-2v-9M2.5 8c0 1.1 2.5 2 5.5 2s5.5-.9 5.5-2"/></svg>',
  mark:     '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 1.5l1.8 4.7L14.5 8l-4.7 1.8L8 14.5 6.2 9.8 1.5 8l4.7-1.8z"/></svg>',
  myday:    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6.5"/><path d="M8 4.5V8l2.5 1.5"/></svg>',
  search:   '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg>',
  bell:     '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 2a4 4 0 0 0-4 4c0 3-1.5 4.5-1.5 4.5h11S12 10.5 12 6a4 4 0 0 0-4-4zM6.5 13a1.5 1.5 0 0 0 3 0"/></svg>',
  up:       '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 13V3M4 7l4-4 4 4"/></svg>',
};

// ─── Nav definitions per role ──────────────────────────────────────────────
// `icon` is a key into ICONS above (rendered as inline SVG in renderLayout).
// Item ids/labels/gating (which items appear per dept/role, incl. the
// frozen-dept solve/sop/mark cut) are UNCHANGED from before this rebuild —
// only the icon representation moved from a glyph char to an ICONS key.
function navFor(dept, role) {
  const isFrozen = dept.frozen === true;
  if (role === 'L1') {
    return [
      { id: 'my',    label: 'My Day',          icon: 'myday' },
      { id: 'kpi',   label: 'My Targets',      icon: 'kpi' },
      { id: 'solve', label: 'Problem-Solving', icon: 'solve' },
      { id: 'sop',   label: 'Standard Work',   icon: 'sop' },
      { id: 'mark',  label: 'Ask Mark',        icon: 'mark' },
    ];
  }
  // L2
  return [
    { id: 'team',  label: 'Overview',        icon: 'overview' },
    { id: 'kpi',   label: 'KPI Boards',      icon: 'kpi' },
    // Hoshin: informational policy-deployment surface, gated like Overview/KPI
    // Boards/Sources (visible even on frozen depts) rather than like the
    // operational tools (solve/sop/mark) — a frozen dept still has a real
    // Hoshin page (objective cards + functional lead), it just has no active
    // 8-step/SOP/Ask-Mark workflows.
    { id: 'hoshin', label: 'Hoshin',         icon: 'hoshin' },
    ...(!isFrozen ? [{ id: 'solve', label: 'Problem-Solving', icon: 'solve' }] : []),
    ...(!isFrozen ? [{ id: 'sop',   label: 'Standard Work',   icon: 'sop' }] : []),
    { id: 'sources', label: 'Sources', icon: 'sources' },
    ...(!isFrozen ? [{ id: 'mark', label: 'Ask Mark', icon: 'mark' }] : []),
  ];
}

function viewLabel(dept, role, view) {
  const item = navFor(dept, role).find(v => v.id === view);
  return item ? item.label : view;
}

// ─── Ask Mark queue count ───────────────────────────────────────────────────
// Mirrors views/askmark.js's header "N action required": live reds
// (redKpisNeedingResponse) that have NOT yet had a response submitted
// (getResponse(...).answered). Deliberately NOT rollupSignal().redCount —
// that counts persisted response entries, a different number from the queue.
function askMarkActionRequiredCount(dept) {
  return redKpisNeedingResponse(dept).filter((item) =>
    !(getResponse({ deptId: dept.id, kpiId: item.kpiId }) || {}).answered
  ).length;
}

// ─── Layout: light sidebar + topbar + canvas ────────────────────────────────
function renderLayout(dept, activeView) {
  const session = store.get().session;
  const persona = session.persona || resolvePersona(dept, session.role) || { name: dept.name, label: '' };
  const role    = session.role;
  const nav     = navFor(dept, role);

  // Both the bell and the topbar "Ask Mark" button open the Ask Mark
  // queue/view — gated the same way the "Ask Mark" nav item is (off on
  // frozen departments), so neither ever routes somewhere unreachable from
  // the sidebar nav.
  const canAskMark   = nav.some(v => v.id === 'mark');
  const askMarkCount = canAskMark ? askMarkActionRequiredCount(dept) : 0;

  const navHtml = nav.map(v => {
    const icon = ICONS[v.icon] || '';
    // 6px red flag: the reference puts this on the "Overview" nav item
    // (its id 'overview'; ours 'team') when a KPI needs attention. L1's
    // home item is "My Day" — a different surface, not an Overview — so it
    // intentionally does not carry this flag.
    const flag = (v.id === 'team' && askMarkCount > 0)
      ? `<span class="nav-flag" title="${askMarkCount} KPI${askMarkCount === 1 ? '' : 's'} need attention"></span>`
      : '';
    return `
      <a href="#/dept/${dept.id}/${v.id}" class="nav-item ${activeView === v.id ? 'is-active' : ''}">
        ${icon}${v.label}${flag}
      </a>`;
  }).join('');

  const roleBadgeClass = role === 'L1' ? 'role-badge role-badge--l1' : 'role-badge';
  const initials = persona.name.split(/[\s/]+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();

  const askMarkBtnHtml = canAskMark ? `
          <button class="btn btn--outline btn--sm" id="assistant-btn" title="Mark — your AI employee">${ICONS.mark} Ask Mark</button>` : '';
  const bellHtml = canAskMark ? `
          <button class="icon-btn" id="inbox-btn" aria-label="Ask Mark — action required" title="Ask Mark — action required">
            ${ICONS.bell}${askMarkCount > 0 ? `<span class="icon-btn__count" id="inbox-btn-count">${askMarkCount}</span>` : ''}
          </button>` : '';

  app.innerHTML = `
    <div class="shell">
      <nav class="sidebar" aria-label="Board navigation">
        <div class="brand">
          <div class="brand__mark">FM</div>
          <div>
            <div class="brand__name">FMDS OS</div>
            <div class="brand__sub">World Emblem</div>
          </div>
        </div>

        <div class="dept-block">
          <span class="running-head">Department</span>
          <div class="dept-block__name">${dept.name}</div>
          <div class="dept-block__meta">
            <span class="${roleBadgeClass}">${role}</span>
            ${persona.name}
          </div>
        </div>

        <div class="nav">
          <span class="running-head">Boards</span>
          ${navHtml}
        </div>

        <div class="sidebar__footer">
          <div class="persona">
            <div class="persona__avatar">${initials}</div>
            <div>
              <div class="persona__name">${persona.name}</div>
              <div class="persona__role">${persona.label || ''}</div>
            </div>
          </div>
          <button class="signout" id="rail-signout">Switch Role / Sign Out</button>
        </div>
      </nav>

      <div class="content-area">
        <header class="topbar">
          <div class="crumb"><b>${dept.name}</b><span class="crumb__sep">/</span>${viewLabel(dept, role, activeView)}</div>
          <div class="topbar__spacer"></div>
          ${askMarkBtnHtml}
          ${bellHtml}
          <div class="topbar__search">${ICONS.search}<input type="search" placeholder="Search this board…" aria-label="Search this board"></div>
          <span class="rollup-tag">${ICONS.up}Rolls up to <b>Leadership OS</b></span>
        </header>

        <main class="canvas">
          <div class="view-mount" id="view-mount"></div>
        </main>
      </div>
    </div>`;

  const mount = document.getElementById('view-mount');
  dispatchView(dept, activeView, mount);

  // Sidebar sign-out
  const signoutBtn = document.getElementById('rail-signout');
  if (signoutBtn) signoutBtn.addEventListener('click', signOut);

  // 🔔 → Ask Mark queue shortcut (standalone Chief-of-Staff popover stays
  // retired; the bell routes into the same queue the "Ask Mark" nav item
  // opens, with a live badge kept in sync by polling — the queue can change
  // from inside the Ask Mark view itself, which repaints only its own
  // mount, not this topbar).
  const inboxBtn = document.getElementById('inbox-btn');
  if (inboxBtn) {
    inboxBtn.addEventListener('click', () => { location.hash = `#/dept/${dept.id}/mark`; });
    startInboxBadgePoll(dept);
  } else {
    stopInboxBadgePoll();
  }

  // Topbar "Ask Mark" button → same destination as the bell/nav item (the
  // full Ask Mark workspace). This replaces the old mini AI-assistant
  // drawer this button used to toggle (see task report for why).
  const assistantBtn = document.getElementById('assistant-btn');
  if (assistantBtn) assistantBtn.addEventListener('click', () => { location.hash = `#/dept/${dept.id}/mark`; });
}

// ─── 🔔 live badge poll ─────────────────────────────────────────────────────
// The Ask Mark queue is backed by __ls (lib/accountability.js) and
// can be mutated by the Ask Mark view without a route change (submitting a
// response calls its own local re-render, not renderLayout()). Poll rather
// than wire a cross-view event so this stays a single-file change.
let _inboxPollTimer = null;

function stopInboxBadgePoll() {
  if (_inboxPollTimer) { clearInterval(_inboxPollTimer); _inboxPollTimer = null; }
}

function startInboxBadgePoll(dept) {
  stopInboxBadgePoll();
  _inboxPollTimer = setInterval(() => {
    const btn = document.getElementById('inbox-btn');
    if (!btn) { stopInboxBadgePoll(); return; } // topbar re-rendered elsewhere (route change)
    const count = askMarkActionRequiredCount(dept);
    let countEl = document.getElementById('inbox-btn-count');
    if (count > 0) {
      if (!countEl) {
        countEl = document.createElement('span');
        countEl.className = 'icon-btn__count';
        countEl.id = 'inbox-btn-count';
        btn.appendChild(countEl);
      }
      countEl.textContent = String(count);
    } else if (countEl) {
      countEl.remove();
    }
  }, 800);
}

// ─── View dispatcher ────────────────────────────────────────────────────────
function dispatchView(dept, view, mount) {
  const session = store.get().session;

  // ODG gets its dedicated method hub as the team view
  if (dept.id === 'odg' && view === 'team') {
    renderOdgHub(dept, mount);
    return;
  }

  switch (view) {
    // 'team' → Overview surface for all departments (role-scoped red/green summary + agent)
    case 'team':
      renderOverview(dept, mount, session);
      break;

    // 'kpi' → detailed KPI Boards:
    //   Operations → location board (Mechanism B) with operator contribution drill
    //   Others     → existing KPI view
    case 'kpi':
      dept.id === 'operations'
        ? renderLocationBoard(dept, mount)
        : renderKpi(dept, mount);
      break;

    case 'hoshin':
      renderHoshin(dept, mount);
      break;
    case 'sources': renderSources(dept, mount); break;
    case 'my': {
      if (session && session.role === 'L1') {
        renderMyDay(dept, mount, session.persona);
      } else {
        renderMyBoard(dept, mount);
      }
      break;
    }
    case 'solve':
      renderProblemSolving(dept, mount);
      break;
    case 'sop':
      renderStandardWork(dept, mount);
      break;
    case 'mark':
      renderAskMark(dept, mount, session);
      break;
    default:
      // ODG: fall back to method hub for unknown views too
      if (dept.id === 'odg') { renderOdgHub(dept, mount); return; }
      renderOverview(dept, mount, session);
  }
}


// ─── Init ───────────────────────────────────────────────────────────────────
addEventListener('hashchange', route);
boot();

;return {};
})();
