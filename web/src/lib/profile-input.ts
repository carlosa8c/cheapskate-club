export function profileInput(form: FormData) {
  const handle = String(form.get("handle") ?? "").trim().toLowerCase();
  const display_name = String(form.get("display_name") ?? "").trim();
  if (!/^[a-z0-9_]{3,30}$/.test(handle)) return null;
  if (!display_name || [...display_name].length > 80) return null;
  return { handle, display_name, sharing_enabled: form.get("sharing_enabled") === "on" };
}
