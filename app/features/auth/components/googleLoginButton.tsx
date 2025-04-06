import { FcGoogle } from "react-icons/fc";
import { Button } from "~/components/ui/button";

type Props = {
  type?: "button" | "submit";
  disabled?: boolean;
};

export default function GoogleLoginButton({ type, disabled }: Props) {
  return (
    <Button
      type={type}
      className="px-[12px] h-[40px] gap-[10px] hover:cursor-pointer"
      disabled={disabled}
    >
      <FcGoogle size={20} />
      Googleアカウントでログイン
    </Button>
  );
}
