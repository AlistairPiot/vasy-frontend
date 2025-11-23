import { z } from 'zod';

export const loginSchema = z.object({
	email: z
		.string()
		.min(1, 'Email requis')
		.email('Email invalide'),
	password: z
		.string()
		.min(1, 'Mot de passe requis')
});

export const registerSchema = z.object({
	email: z
		.string()
		.min(1, 'Email requis')
		.email('Email invalide'),
	password: z
		.string()
		.min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
	confirmPassword: z
		.string()
		.min(1, 'Confirmation du mot de passe requise')
}).refine((data) => data.password === data.confirmPassword, {
	message: 'Les mots de passe ne correspondent pas',
	path: ['confirmPassword']
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
