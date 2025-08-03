import { Form } from "react-router";
import { useNavigation } from "~/hooks/useNavigation";
import GoogleLoginButton from "./googleLoginButton";

export default function LoginForm() {
	const { isSubmitting } = useNavigation();

	return (
		<div className="h-screen flex justify-center items-center">
			<Form method="POST">
				<GoogleLoginButton type="submit" disabled={isSubmitting} />
			</Form>
		</div>
	);
}
