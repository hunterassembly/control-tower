# Task Detail & Updates

**Branch Name:** `feature/task-detail-and-updates`

## Background and Motivation
The task detail page is the heart of the design workflow. Designers submit updates with Loom videos, Figma links, and files. Clients review them here with a clean timeline view. A smooth flow here means fewer "Where's the latest file?" messages and faster feedback loops.

**DESIGN ANALYSIS**: The mockup shows a sophisticated 70/30 split layout with a comprehensive update review system, rich timeline display, and role-based action flows.

## Key Challenges and Analysis
1. **Complex Update Review Workflow**: Blue notification banners, different update types (Design/Status/Follow-up), role-based "Review Update" buttons
2. **Rich Timeline Display**: Chronological updates with avatars, timestamps, status badges, summaries, and comment counts
3. **Multi-file Upload System**: Supabase Storage + signed URLs, progress feedback, thumbnail generation
4. **Role-Based UI**: Different actions for Designers vs Reviewers/Clients vs Admins
5. **Real-time Notifications**: Update status changes need to trigger notifications and timeline entries
6. **Responsive Embed Rendering**: Figma, Loom embeds with secure CSP headers
7. **Audit Trail**: Immutable timeline with payload JSON for complete history

## High-level Task Breakdown

### **PHASE 1: Core Layout & Navigation**
- [ ] **(1)** Create branch `feature/task-detail-and-updates` off `main`.
- [ ] **(2)** Scaffold `/tasks/[taskId]` route with 70/30 split layout, sticky RHS sidebar.
- [ ] **(3)** Build task header with: title, metadata row (Designer, Reviewer, Last Updated, Status badge).
- [ ] **(4)** Implement breadcrumb navigation from project task list.

### **PHASE 2: Task Content Display**  
- [ ] **(5)** Build main content area with description section (rich text rendering).
- [ ] **(6)** Add Background section with collapsible/expandable content.
- [ ] **(7)** Implement Requirements section with formatted bullet lists.
- [ ] **(8)** Style status badges with color coding (Waiting for review = orange, etc.).

### **PHASE 3: Update Notification System**
- [ ] **(9)** Build blue notification banner "An update is ready for you to review!"
- [ ] **(10)** Add "Review Update" button with role-based visibility (Reviewers/Admins only).
- [ ] **(11)** Implement notification dismissal and persistence.
- [ ] **(12)** Connect to pending updates query from database.

### **PHASE 4: Timeline & Updates Display**
- [ ] **(13)** Build timeline sidebar with chronological update list.
- [ ] **(14)** Implement update cards with: avatar, name, timestamp, type badge, summary.
- [ ] **(15)** Add update type badges: "Design update", "Status update", "Follow-up question".
- [ ] **(16)** Display comment counts and "Review Update" buttons per update.
- [ ] **(17)** Implement relative timestamps ("2d", "10 days ago") with hover for absolute dates.

### **PHASE 5: Update Creation Modal**
- [ ] **(18)** Build "Add Update" modal with fields: type selector, summary, Loom URL, Figma URL.
- [ ] **(19)** Add file dropzone using `react-dropzone` with drag & drop.
- [ ] **(20)** Implement file upload progress bars and thumbnail previews.
- [ ] **(21)** Upload files to Supabase Storage with signed URLs.

### **PHASE 6: Update Review Workflow**
- [ ] **(22)** Build update review modal with embedded content (Figma/Loom iframes).
- [ ] **(23)** Add review actions: Approve, Request Changes, Add Comment.
- [ ] **(24)** Update task status based on review decisions.
- [ ] **(25)** Send timeline entries for all review actions.

### **PHASE 7: Assets & Actions Sidebar**
- [ ] **(26)** Build Assets section with file downloads and external links.
- [ ] **(27)** Add Actions section with "Close Task" and other role-based buttons.
- [ ] **(28)** Implement file versioning and replacement (Designer only).

### **PHASE 8: Real-time & Polish**
- [ ] **(29)** Add Supabase real-time subscriptions for live updates.
- [ ] **(30)** Implement optimistic updates with React Query cache management.
- [ ] **(31)** Add keyboard shortcuts and accessibility improvements.
- [ ] **(32)** Mobile responsive design and touch interactions.

### Acceptance Criteria
1. **Visual Fidelity**: Matches mockup exactly with proper spacing, colors, typography.
2. **Update Workflow**: Complete create → review → approve flow with timeline logging.
3. **File Management**: Upload supports multiple files up to 1GB each with progress feedback.
4. **Role-Based Access**: Different UI/actions for Designer vs Reviewer vs Admin roles.
5. **Real-time Updates**: Changes by other users appear immediately via subscriptions.
6. **Performance**: Initial load ≤300ms, smooth animations, no layout shifts.

## Project Status Board

### **CORE PLANNING** ✅
- [x] ✅ **Design Analysis Complete**: Comprehensive breakdown of mockup elements
- [x] ✅ **Task Breakdown Complete**: 32 detailed tasks across 8 phases  
- [ ] **Database Schema Review**: Verify task_update, task_asset tables support all features

### **PHASE 1: Layout & Navigation** 
- [ ] Branch created
- [ ] Route scaffolding  
- [ ] Split layout (70/30)
- [ ] Task header & metadata
- [ ] Breadcrumb navigation

### **PHASE 2: Content Display**
- [ ] Description section
- [ ] Background section  
- [ ] Requirements section
- [ ] Status badge styling

### **PHASE 3: Notification System**
- [ ] Blue notification banner
- [ ] Review Update button
- [ ] Notification persistence
- [ ] Pending updates query

### **PHASE 4: Timeline Display** 
- [ ] Timeline sidebar
- [ ] Update cards
- [ ] Type badges
- [ ] Comment counts
- [ ] Relative timestamps

### **PHASE 5: Update Creation**
- [ ] Add Update modal
- [ ] File dropzone
- [ ] Upload progress
- [ ] Supabase Storage

### **PHASE 6: Review Workflow**
- [ ] Review modal
- [ ] Approve/Request Changes
- [ ] Status updates  
- [ ] Timeline logging

### **PHASE 7: Assets & Actions**
- [ ] Assets sidebar
- [ ] Actions section
- [ ] File versioning

### **PHASE 8: Real-time & Polish**
- [ ] Real-time subscriptions
- [ ] Optimistic updates
- [ ] Accessibility
- [ ] Mobile responsive
- [ ] Ready for merge

## Detailed UI Requirements (From Design Analysis)

### **Header Area**
- Task title as H1: "Update the current logo"  
- Metadata row with 4 elements:
  - 👨‍💻 Designer: Damien Chmel (with avatar)
  - 👥 Reviewer: Dave Cohen  
  - 📅 Last Updated: April 15, 2025
  - 🏷️ Status: "Waiting for review" (orange badge)

### **Notification Banner** 
- Blue background (`bg-blue-50 border-blue-200`)
- Icon + text: "An update is ready for you to review!"
- "Review Update" button (blue, primary style)
- Dismissible with X button
- Only visible when pending updates exist for current user's role

### **Main Content Sections**
1. **Description**: Rich text with paragraph breaks
2. **Background**: Collapsible section with detailed context
3. **Requirements**: Bullet list with specific deliverables
   - "Explore 2-3 updated versions deep and close to the original..."
   - "Adjust typeface to improve readability at small sizes"
   - "Create both horizontal and stacked variations"
   - "Include black, white, and color options"
   - "Export in SVG + PNG (400px min), plus vector source file"

### **Timeline Sidebar (RHS)**
- **Updates Section** with chronological entries:
  - Avatar + name (Damien Chmel)
  - Relative timestamp (2d, 12 April, 2025)  
  - Update type badge: "Design update", "Status update", "Follow-up question"
  - Status indicator: "Waiting for review", "Reviewed"
  - Summary text preview
  - Comment count (e.g., "0", "2", "4")
  - "Review Update" button for pending items

### **Actions Section**
- "Close Task" button
- Additional role-based actions (TBD)

### **Assets Section** 
- Links: "https://westian.com"
- Files: "brand-guidelines.zip", "social_templates.fig"
- Download buttons and preview thumbnails

### **Color Scheme & Styling**
- Status badges: Orange for "Waiting for review", Green for "Reviewed"
- Blue notification banners and primary buttons
- Light gray backgrounds for sections
- Proper hover states and transitions
- Consistent avatar sizing and positioning

## Current Status / Progress Tracking
**STATUS**: Comprehensive design analysis complete. Ready for Executor implementation.

**NEXT STEP**: Executor should begin with Phase 1 (Layout & Navigation) and work through phases sequentially, reporting back after each phase completion.

## Executor's Feedback or Assistance Requests
*(Executor will populate this section with progress updates, questions, and blockers)*

--- 