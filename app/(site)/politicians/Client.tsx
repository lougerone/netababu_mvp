function mapPolitician(r: any): Politician {
  const f = r.fields || {};
  const getFirst = (arr?: any[]) => (Array.isArray(arr) && arr.length ? arr[0] : null);
  const parseList = (val: any) => {
    if (Array.isArray(val)) return val;
    return val ? String(val).split(/\n|,|;/).map((s:string)=>s.trim()).filter(Boolean) : [];
  };

  return {
    id: r.id,
    slug: f.slug || r.id,
    name: f.name || "",
    dob: f.dob || f.DOB || null,
    offices: parseList(f.offices),
    life_events: f.life_events || null,
    photo: getFirst(f.photo || f.Photo),
    links: parseList(f.links),
    party: f.Party || f.party,
    state: f.Constituency || f.state,
    current_position: f.Position || f.position,
    position: f.Position || f.position,
    constituency: f.Constituency || f.constituency,
    age: f.Age || f.age,
    yearsInPolitics: f["Years in politics"] || f["Years in office"],
    attendance: f["% Parliament Attendance"] || f["Parliament Attendance"],
    assets: f["Declared Assets"] || f.assets,
    liabilities: f["Declared Liabilities"] || f.liabilities,
    criminalCases: f["Criminal Cases"] || f.criminalCases,
    website: f.Website || f.website,
  };
}
