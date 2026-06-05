import PlusCrosshair from './PlusCrosshair';

export default function SectionDivider() {
  return (
    <div className="border-y border-border-subtle overflow-hidden">
      <div className="max-w-content mx-auto border-x border-border-subtle flex flex-col relative h-16">
        <PlusCrosshair />
        <span className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 z-10">
          <PlusCrosshair />
        </span>
        <span className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 z-10">
          <PlusCrosshair />
        </span>
        <span className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 z-10">
          <PlusCrosshair />
        </span>
        <span className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 z-10">
          <PlusCrosshair />
        </span>
      </div>
    </div>
  );
}
