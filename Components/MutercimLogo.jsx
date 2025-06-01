import Link from "next/link";

export default function MutercimLogo({ absolute = false, width = false }) {
  return (
    <div className={`flex justify-start ${absolute ? 'absolute' : ''} ${width ? 'w-full' : ''}`}>
      <Link className="h-10 w-28 bg-[#d3e3fd] hover:bg-[#c8e6fc] text-xl flex items-center justify-center font-bold self-start p-4 rounded-lg" href="/">
        Mütercim
      </Link>
    </div>
  );
}
