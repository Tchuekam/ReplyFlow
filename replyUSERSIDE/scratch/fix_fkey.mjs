const token = "sbp_ea281b0d0660cf2b0967deb4ea750dc100b7fc61";
const projectId = "uihvnoyeucpitsqfhkaq";

const query = `
ALTER TABLE businesses DROP CONSTRAINT IF EXISTS businesses_id_fkey;
`;

(async () => {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectId}/database/query`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });
  if (!res.ok) {
    console.error("SQL Error:", await res.text());
    process.exit(1);
  } else {
    console.log("Foreign key severed cleanly.");
  }
})();
