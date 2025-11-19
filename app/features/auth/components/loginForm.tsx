import { Form } from "react-router";
import { useNavigation } from "~/hooks/useNavigation";
import GoogleLoginButton from "./googleLoginButton";

type LoginFormProps = {
	error: string | null;
};

const ERROR_MESSAGES: Record<string, string> = {
	missing_params: "認証に必要なパラメータが不足しています。もう一度お試しください。",
	auth_failed: "認証に失敗しました。もう一度お試しください。",
	server_error: "サーバーエラーが発生しました。しばらくしてからお試しください。",
	network_error: "ネットワークエラーが発生しました。接続を確認してください。",
	login_failed: "ログインに失敗しました。もう一度お試しください。",
	invalid_response: "無効な応答を受信しました。もう一度お試しください。",
};

export default function LoginForm({ error }: LoginFormProps) {
	const { isSubmitting } = useNavigation();

	return (
		<div className="h-screen flex justify-center items-center">
			<div className="flex flex-col items-center gap-4">
				{error && (
					<div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded max-w-md text-center">
						{ERROR_MESSAGES[error] || "エラーが発生しました。もう一度お試しください。"}
					</div>
				)}
				<Form method="POST">
					<GoogleLoginButton type="submit" disabled={isSubmitting} />
				</Form>
			</div>
		</div>
	);
}
