# Discord release announcements

UtilityCraft can publish its GitHub release announcement to Discord in two publication modes, plus a safe disabled state, without using the CurseForge Core API.

## Modes

- `automatic`: after the CurseForge upload succeeds, the release workflow waits one hour and publishes the announcement with a processing warning.
- `manual`: the release workflow does not announce automatically. Run **Publish Discord Release Announcement** after CurseForge approves the file. Leaving `release_tag` blank selects the latest GitHub release.
- `disabled`: no workflow can send to Discord. The manual workflow only generates a preview.

The manual workflow is also the fallback if an automatic announcement fails. Change the repository mode to `manual` before running it. Both modes record a commit status for the release tag, so a successful announcement is not sent twice.

## Configuration

The organization provides:

- Secret `DISCORD_UPDATES_WEBHOOK`: Discord webhook URL.
- Variable `DISCORD_UPDATES_ROLE_ID`: role ID used when pinging Updates.

Each repository controls:

- `DISCORD_ANNOUNCEMENT_MODE`: `disabled`, `automatic` or `manual`.
- `DISCORD_PING_UPDATES`: `true` or `false` for automatic announcements. Manual runs ask each time.

Keep the mode set to `disabled` while the organization secret points to a test webhook. Replace it with the official webhook first, then select `automatic` for normal releases or `manual` for a first release that may need extended CurseForge review.
