export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24 content-center justify-center h-full bg-white ">
      <div className="aspect-[2000/857] w-full relative">
        <div className="world-map h-full w-full  from-indigo-500 bg-gradient-to-l to-emerald-500 "></div>
        <div className="absolute left-1/2 top-0 bg-white">Europe</div>
      </div>
    </main>
  );
}
