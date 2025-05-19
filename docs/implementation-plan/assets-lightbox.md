# Assets Lightbox

**Branch Name:** `feature/assets-lightbox`

## Background and Motivation
Large design files need a pleasant gallery / lightbox for preview and download, plus delete for owner.

## Key Challenges and Analysis
1. Rendering mixed file types (PNG, PDF, MP4) with fallback icons when preview unsupported.
2. Handling signed URL expiry after 24h; refresh on demand.
3. Ensuring keyboard accessibility within lightbox navigation.

## High-level Task Breakdown
- [ ] **(1)** Create branch `feature/assets-lightbox` off `main`.
- [ ] **(2)** Build Assets grid component re-usable across Task Detail.
- [ ] **(3)** Implement lightbox overlay with arrow navigation and ESC close.
- [ ] **(4)** Fetch signed URLs per asset; cache & refresh on 401.
- [ ] **(5)** Add delete (owners only) with confirmation dialog; delete `task_asset` row & storage object.

### Acceptance Criteria
1. Grid displays thumbnails for images and generic icons for unsupported types.
2. Lightbox navigates with arrow keys and closes with ESC.
3. Deleting an asset removes it from list and storage within 1s.

## Project Status Board
- [ ] Planning ✅
- [ ] Branch created
- [ ] Grid component done
- [ ] Lightbox done
- [ ] Signed URL refresh done
- [ ] Delete flow done
- [ ] Ready for merge

## Current Status / Progress Tracking
*(empty)*

## Executor's Feedback or Assistance Requests
*(empty)*

--- 