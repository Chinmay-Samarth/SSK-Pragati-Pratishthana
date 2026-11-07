"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      className="btn-primary"
      onClick={() => {
        const previousTitle = document.title;
        document.title = " ";

        const restore = () => {
          document.title = previousTitle;
          window.removeEventListener("afterprint", restore);
        };
        window.addEventListener("afterprint", restore);

        // Let the title update apply before the print dialog opens
        window.setTimeout(() => {
          window.print();
        }, 0);
      }}
    >
      Print
    </button>
  );
}
