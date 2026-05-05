import AiPromptBox from "./components/AiPromptBox";

export default function GuestView() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-xl space-y-2">
        <h1 className="text-2xl font-medium">What can I help with?</h1>
        <AiPromptBox />
      </div>
    </div>
  );
}
