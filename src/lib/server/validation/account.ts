import { z } from 'zod';

const email = z
	.string()
	.trim()
	.min(1, 'メールアドレスを入力してください')
	.max(320, 'メールアドレスが長すぎます')
	.email('メールアドレスの形式を確認してください');

const password = z
	.string()
	.min(15, 'パスワードは15文字以上で入力してください')
	.max(128, 'パスワードは128文字以内で入力してください');

export const registerSchema = z.object({
	email,
	displayName: z
		.string()
		.trim()
		.min(1, '表示名を入力してください')
		.max(80, '表示名は80文字以内で入力してください'),
	password
});

export const loginSchema = z.object({ email, password: z.string().min(1).max(128) });

export function accountInputFromFormData(formData: FormData) {
	return {
		email: String(formData.get('email') ?? ''),
		displayName: String(formData.get('displayName') ?? ''),
		password: String(formData.get('password') ?? '')
	};
}
