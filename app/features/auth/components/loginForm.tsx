import { Form, useNavigation } from "react-router";
import GoogleLoginButton from "./googleLoginButton";

export default function LoginForm() {
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";

	return (
		<div className="h-screen flex justify-center items-center">
			<Form method="POST">
				<GoogleLoginButton type="submit" disabled={isSubmitting} />
			</Form>
		</div>
	);
}
