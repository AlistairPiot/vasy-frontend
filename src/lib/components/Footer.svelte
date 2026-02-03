<script lang="ts">
	const currentYear = new Date().getFullYear();
</script>

<footer class="bg-muted border-t mt-auto">
	<div class="container mx-auto px-4 py-8">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
			<!-- À propos -->
			<div>
				<h3 class="font-semibold text-lg mb-4">Vasy</h3>
				<p class="text-sm text-muted-foreground">
					La plateforme qui connecte créateurs et clients pour des produits uniques et authentiques.
				</p>
			</div>

			<!-- Légal -->
			<div>
				<h3 class="font-semibold text-lg mb-4">Légal</h3>
				<ul class="space-y-2">
					<li>
						<a href="/legal/about" class="text-sm text-muted-foreground hover:text-foreground transition-colors">
							À propos de nous
						</a>
					</li>
					<li>
						<a href="/legal/cgv" class="text-sm text-muted-foreground hover:text-foreground transition-colors">
							CGV
						</a>
					</li>
					<li>
						<a href="/legal/cgu" class="text-sm text-muted-foreground hover:text-foreground transition-colors">
							CGU
						</a>
					</li>
					<li>
						<a href="/legal/privacy" class="text-sm text-muted-foreground hover:text-foreground transition-colors">
							Confidentialité
						</a>
					</li>
					<li>
						<a href="/legal/mentions" class="text-sm text-muted-foreground hover:text-foreground transition-colors">
							Mentions légales
						</a>
					</li>
				</ul>
			</div>

			<!-- Contact -->
			<div>
				<h3 class="font-semibold text-lg mb-4">Contact</h3>
				<ul class="space-y-2">
					<li class="text-sm text-muted-foreground">
						Email: <a href="mailto:vasy.creation.contact@gmail.com" class="hover:text-foreground transition-colors">vasy.creation.contact@gmail.com</a>
					</li>
				</ul>
			</div>
		</div>

		<!-- Copyright -->
		<div class="border-t mt-8 pt-6 text-center">
			<p class="text-sm text-muted-foreground">
				© {currentYear} Vasy. Tous droits réservés.
			</p>
		</div>
	</div>
</footer>
