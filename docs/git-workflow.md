# Git Workflow & Branching Strategy

## 🎯 **CORE PRINCIPLE**: Never let branches diverge for long periods

## **MANDATORY WORKFLOW**

### **1. Starting ANY New Feature**
```bash
# ALWAYS start from latest main
git checkout main
git pull origin main

# Create new feature branch from fresh main
git checkout -b feature/your-feature-name

# Push immediately to establish remote tracking
git push -u origin feature/your-feature-name
```

### **2. Daily Development Hygiene** 
```bash
# EVERY MORNING before starting work
git checkout main
git pull origin main
git checkout feature/your-feature-name
git rebase main  # Keep your branch current

# If conflicts arise, resolve immediately while they're small
```

### **3. Before Any Major Work Session**
```bash
# Check if main has moved ahead
git fetch origin
git log --oneline main..origin/main  # Shows new commits on main

# If main has new commits, rebase immediately
git rebase origin/main
```

### **4. Branch Completion & Merge Process**

#### **REQUIRED CHECKLIST** ✅
- [ ] **Tests pass**: All functionality tested
- [ ] **Documentation updated**: Implementation plan, lessons learned
- [ ] **Main is current**: Branch rebased on latest main
- [ ] **Conflicts resolved**: Clean merge possible
- [ ] **PR ready**: No work-in-progress commits

#### **MERGE PROCESS**
```bash
# Final sync before merge
git checkout main
git pull origin main
git checkout feature/your-feature-name
git rebase main

# If clean, merge to main
git checkout main
git merge feature/your-feature-name
git push origin main

# Clean up
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

### **5. When Multiple Features Are In Progress**

#### **COORDINATION RULES**
- 🚨 **No more than 2-3 active feature branches at once**
- 🚨 **Merge oldest branches first** (FIFO principle)
- 🚨 **Daily main sync** for all active branches
- 🚨 **Immediate conflict resolution** - never let them accumulate

#### **BRANCH PRIORITY SYSTEM**
1. **HIGH**: Core functionality (auth, data, routing)
2. **MEDIUM**: UI features (task management, details)  
3. **LOW**: Polish features (animations, styling)

**Rule**: HIGH priority branches get merged first, others rebase frequently.

## **EMERGENCY PROCEDURES**

### **When You Realize Your Branch Is Behind**
```bash
# Don't panic! Standard rebase procedure:
git checkout main
git pull origin main
git checkout feature/your-branch
git rebase main

# If conflicts arise:
# 1. Resolve each conflict file by file
# 2. git add <resolved-files>
# 3. git rebase --continue
# 4. Repeat until complete

# When done:
git push --force-with-lease origin feature/your-branch
```

### **When Multiple Conflicts Exist**
```bash
# Option 1: Rebase (preserves history)
git rebase main

# Option 2: Merge (if rebase is too complex)
git merge main

# Option 3: Nuclear option (if everything is fucked)
# Save your work first!
git diff > my-changes.patch
git checkout main
git pull origin main
git checkout -b feature/your-branch-v2
git apply my-changes.patch
```

## **PREVENTION STRATEGIES**

### **Branch Naming Convention**
```
feature/descriptive-name
hotfix/critical-issue
experiment/proof-of-concept
```

### **Commit Message Standards**
```
feat: Add user authentication
fix: Resolve login redirect issue  
docs: Update git workflow process
refactor: Simplify task data hooks
```

### **Regular Maintenance**
```bash
# Weekly cleanup (run every Friday)
git branch --merged main | grep -v main | xargs git branch -d
git remote prune origin
git gc
```

## **TEAM COMMUNICATION**

### **Before Starting Large Features**
1. 📢 **Announce in team chat**: "Starting feature/project-task-list"
2. 📋 **Create implementation plan**: Document in docs/implementation-plan/
3. ⏰ **Set merge deadline**: "Target merge: Friday"
4. 🔄 **Daily updates**: Progress and any blocking issues

### **When Conflicts Arise**
1. 🚨 **Immediate notification**: "Conflicts in feature/X, resolving now"
2. 📝 **Document resolution**: Add to lessons learned
3. ✅ **Confirm resolution**: "Conflicts resolved, branch clean"

## **LESSONS FROM OUR RECENT PAIN**

### **What Went Wrong**
- ❌ Task detail branch created from old main
- ❌ Project task list merged without rebasing other branches
- ❌ Multiple branches with same files (supabase.ts, package.json)
- ❌ Long-running branches without main sync

### **What We Fixed**
- ✅ Rebased task detail onto merged main
- ✅ Resolved conflicts systematically
- ✅ Used --force-with-lease for safe push
- ✅ Documented the process

### **Never Again Rules**
- 🔒 **No branch can be >5 commits behind main**
- 🔒 **No branch can exist >1 week without main sync**
- 🔒 **No merge without rebase-first for cleaner history**
- 🔒 **No force push without --force-with-lease**

## **QUICK REFERENCE COMMANDS**

```bash
# Daily start routine
git checkout main && git pull origin main

# Check if your branch is behind
git log --oneline feature/your-branch..main

# Safe rebase
git rebase main

# Safe force push
git push --force-with-lease origin feature/your-branch

# Emergency branch status
git status && git log --oneline -5

# Clean up merged branches
git branch --merged main | grep -v main | xargs git branch -d
```

---

## **🎯 GOLDEN RULE**

> **"When in doubt, rebase early and often. Conflicts are easier to resolve when they're small."**

**Follow this workflow religiously and we'll never have another messy rebase situation again!** 🚀 