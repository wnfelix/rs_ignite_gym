import {
	VStack,
	Image,
	Text,
	Center,
	Heading,
	ScrollView,
	useToast,
} from "native-base";

import LogoSvg from "@assets/logo.svg";
import BackgroundImg from "@assets/background.png";
import { Input } from "@components/Input";
import { Button } from "@components/Button";
import { useNavigation } from "@react-navigation/native";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { api } from "@services/api";
import axios from "axios";
import { AppError } from "@utils/AppError";
import { useState } from "react";
import { useAuth } from "@hooks/useAuth";

interface IFormDataProps {
	name: string;
	email: string;
	password: string;
	password_confirm: string;
}

const signUpSchema = yup.object({
	name: yup.string().required("Informe o nome"),
	email: yup.string().required("Informe o email").email("Email inválido"),
	password: yup
		.string()
		.required("Informe a senha")
		.min(6, "A senha deve ter pelo menos 6 dígitos"),
	password_confirm: yup
		.string()
		.required("Confirme a senha")
		.min(6, "A senha deve ter pelo menos 6 dígitos")
		.oneOf([yup.ref("password")], "A senha é diferente"),
});

export function SignUp() {
	const navigator = useNavigation();
	const toast = useToast();
	const [isLoading, setIsLoading] = useState(false);
	const { signIn } = useAuth();

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<IFormDataProps>({
		resolver: yupResolver(signUpSchema),
	});

	function handleGoBack() {
		navigator.goBack();
	}

	async function handleSignUp({ name, email, password }: IFormDataProps) {
		try {
			setIsLoading(true);
			await api.post("/users", { name, email, password });
			await signIn(email, password);
		} catch (error) {
			setIsLoading(false);
			const isAppError = error instanceof AppError;
			const title = isAppError
				? error.message
				: "Não foi possível criar a conta tente novamente mais tarde";

			toast.show({
				title: title,
				placement: "top",
				bgColor: "red.500",
			});

			if (axios.isAxiosError(error)) {
				console.log("axios error", error.response?.data.message);
			}
		}
	}

	return (
		<ScrollView
			contentContainerStyle={{ flexGrow: 1 }}
			showsVerticalScrollIndicator={false}
		>
			<VStack flex={1} bg="gray.700" px={10} pb={16}>
				<Image
					source={BackgroundImg}
					defaultSource={BackgroundImg}
					alt="pessoas treinando"
					resizeMode="contain"
					position="absolute"
				/>
				<Center my={24}>
					<LogoSvg />
					<Text color="gray.100" fontSize="sm">
						Treine sua mente e seu corpo
					</Text>
				</Center>
				<Center>
					<Heading color="gray.100" fontSize="xl" mb={6} fontFamily="heading">
						Crie sua conta
					</Heading>
					<Controller
						control={control}
						name="name"
						render={({ field: { onChange, value } }) => (
							<Input
								placeholder="Nome"
								onChangeText={onChange}
								value={value}
								errorMessage={errors.name?.message}
							/>
						)}
					/>
					<Controller
						control={control}
						name="email"
						render={({ field: { onChange, value } }) => (
							<Input
								placeholder="E-mail"
								keyboardType="email-address"
								autoCapitalize="none"
								onChangeText={onChange}
								value={value}
								errorMessage={errors.email?.message}
							/>
						)}
					/>
					<Controller
						control={control}
						name="password"
						render={({ field: { onChange, value } }) => (
							<Input
								placeholder="Senha"
								secureTextEntry
								onChangeText={onChange}
								value={value}
								errorMessage={errors.password?.message}
							/>
						)}
					/>
					<Controller
						control={control}
						name="password_confirm"
						render={({ field: { onChange, value } }) => (
							<Input
								placeholder="Confirme a Senha"
								secureTextEntry
								onChangeText={onChange}
								value={value}
								onSubmitEditing={handleSubmit(handleSignUp)}
								returnKeyType="send"
								errorMessage={errors.password_confirm?.message}
							/>
						)}
					/>
					<Button
						title="Criar e acessar"
						onPress={handleSubmit(handleSignUp)}
						isLoading={isLoading}
					/>
				</Center>
				<Button
					mt={16}
					title="Voltar para o login"
					variant="outline"
					onPress={handleGoBack}
				/>
			</VStack>
		</ScrollView>
	);
}
