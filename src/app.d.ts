declare global {
	namespace App {
		interface Locals {
			token?: string;
			user?: {
				id: string;
				email: string;
				role: 'admin' | 'creator' | 'client';
			};
		}
	}
}

export {};
