export function Phonetic({ text }: { text: string }) {
  return (
    <div
      className="phonetic"
      title="美式讀音參考；整句音標以逐字讀音呈現，實際語音可能有不同連音、弱讀與重音"
    >
      <span className="phonetic-label">美式 IPA</span>
      <span lang="en-US">/{text}/</span>
    </div>
  );
}
