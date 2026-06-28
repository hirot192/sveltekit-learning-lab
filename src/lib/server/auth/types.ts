export type PublicUser = {
	id: string;
	email: string;
	displayName: string;
};

export type AuthenticatedSession = {
	id: string;
	expiresAt: Date;
};
