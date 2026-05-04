# Tracker BitTorrent privé — sandbox éducatif

Ce dépôt est un bac à sable technique pour comprendre l'architecture d'un tracker privé semi-fermé. Il est conçu pour des contenus légaux uniquement : fichiers personnels, données de test, distributions libres, contenus sous licence libre ou contenus dont vous possédez les droits.

## Démarrage

```bash
cp .env.example .env
docker compose up --build
```

Services exposés :

- API tracker : `http://localhost:3000`
- Announce demo : `/announce/0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef?info_hash=%11%11%11%11%11%11%11%11%11%11%11%11%11%11%11%11%11%11%11%11&peer_id=-TS0001-123456789012&port=51413&uploaded=0&downloaded=0&left=134217728&compact=1&event=started`
- Frontend : `http://localhost:5173`
- PostgreSQL : `localhost:5432`
- Meilisearch : `http://localhost:7700`
- Redis : `localhost:6379`

## 1. Philosophie & règles du jeu

### Ratio upload/download

Le ratio est une métrique incitative :

```text
ratio = uploaded_bytes / max(downloaded_bytes, 1)
```

Règles recommandées :

| Statut | Ratio minimal | Ancienneté minimale | Droits |
|---|---:|---:|---|
| Newbie | 0.40 après 5 GiB téléchargés | 0 jour | Téléchargement limité, peu d'invitations |
| Member | 0.70 | 14 jours | Téléchargement normal, commentaires, favoris |
| Elite | 1.05 | 90 jours | Upload prioritaire, plus d'invitations, freeleech ciblé |
| VIP | exempt ou 0.25 symbolique | manuel ou abonnement interne sandbox | Pas de blocage automatique, accès à des outils avancés |

Évitez de bloquer un compte dès le premier gigaoctet téléchargé. Utilisez une période de grâce : par exemple, ratio non bloquant avant 5 GiB de download.

### Seed bonus

Un seed bonus récompense le maintien en seed, surtout sur les torrents peu actifs.

Modèle simple :

```text
points = durée_seed_heures × coefficient_torrent × coefficient_rareté
coefficient_rareté = 1 + min(4, 1 / max(seeders, 1))
```

Échange possible :

```text
1 point = 50 MiB d'upload crédité
100 points = invitation sandbox
500 points = badge cosmétique
```

La table `bonus_ledger` garde un journal immuable des points. Le worker `backend/src/seed-bonus.worker.ts` montre le principe d'un crédit périodique.

## 2. Stack technique moderne

### Laravel vs NestJS

#### Laravel

Avantages :

- Très rapide pour construire le forum, les pages d'administration, l'authentification et la modération.
- Écosystème mature : queues, policies, notifications, Horizon, Scout.
- Avec Octane, Laravel peut fonctionner avec des workers persistants et réduire fortement le coût de boot.

Limites pour un endpoint `/announce` à forte volumétrie :

- Le modèle PHP traditionnel request/response est moins naturel pour des optimisations bas niveau.
- Il faut être très rigoureux avec Octane pour éviter les états globaux persistants accidentels.

#### NestJS + Fastify

Avantages :

- Très bon compromis entre structure d'application et performance HTTP.
- Typage TypeScript utile pour les payloads d'annonce, la recherche et les workers.
- Fastify est adapté aux endpoints très fréquents, minimalistes et à faible latence.
- Intégration Redis/PostgreSQL/Meilisearch propre côté Node.

Choix recommandé pour ce sandbox : **NestJS + Fastify pour le tracker/API**, et éventuellement un back-office Laravel séparé si l'équipe maîtrise PHP.

Architecture hybride possible :

```text
/api web + forum        -> Laravel ou NestJS
/announce très chaud    -> microservice NestJS/Fastify ou Go/Rust si besoin extrême
/search                 -> Meilisearch/Elasticsearch
/jobs                   -> workers Node ou PHP queue
```

### PostgreSQL à grande échelle

Le schéma minimum est dans `sql/001_schema.sql`.

Tables principales :

- `users` : passkey, classe, ratio, points bonus, état du compte.
- `torrents` : info_hash, nom, catégorie, compteurs, statut.
- `torrent_files` : chemins internes à indexer dans le moteur de recherche.
- `peers` : état actif des clients qui annoncent.
- `snatch_list` : historique de téléchargement par utilisateur/torrent.
- `announce_events` : journal d'audit et détection de fraude.
- `bonus_ledger` : ledger de seed bonus.

Optimisations importantes :

- `info_hash` en `BYTEA(20)` avec colonne générée `info_hash_hex`.
- Index composite `peers(torrent_id, seeder)` pour les compteurs.
- Expiration régulière des peers inactifs : `DELETE FROM peers WHERE announced_at < now() - interval '90 minutes'`.
- Partitionnement futur de `announce_events` par mois.
- Compteurs chauds dans Redis, flush agrégé vers PostgreSQL.

### Frontend sombre et réactif

Le frontend de démonstration utilise React + TanStack Table.

Composants recommandés :

- `@tanstack/react-table` : tri, pagination, virtualisation compatible.
- `@tanstack/react-query` : cache API et refresh contrôlé.
- Virtualisation : `@tanstack/react-virtual` si les listes dépassent quelques milliers de lignes.
- WebSocket/SSE pour seeders/leechers en quasi temps réel.
- Design : table dense, badges catégorie, chips seed/leech, raccourcis clavier, recherche globale.

## 3. Cœur du tracker

### Announce HTTP privé

Un client BitTorrent appelle régulièrement :

```text
GET /announce/{passkey}?info_hash=<20 bytes>&peer_id=<20 bytes>&port=51413&uploaded=...&downloaded=...&left=...&event=started|completed|stopped&compact=1
```

Paramètres importants :

- `info_hash` : hash SHA-1 du dictionnaire `info` du `.torrent`, exactement 20 octets.
- `peer_id` : identifiant client, 20 octets.
- `uploaded`, `downloaded`, `left` : compteurs absolus de la session côté client.
- `event` : `started`, `completed`, `stopped` ou absent.
- `compact=1` : retourne une liste compacte de peers IPv4 sous forme de blocs de 6 octets.

Réponse bencodée :

```text
d8:completei42e10:incompletei3e8:intervali1800e12:min intervali900e5:peers...e
```

### Passkey unique

Génération :

```sql
encode(gen_random_bytes(32), 'hex') -- 64 caractères hex
```

Règles :

- Un passkey par utilisateur, rotatif.
- Ne jamais le journaliser en clair dans les logs applicatifs.
- En production, préférer stocker `HMAC(passkey, server_secret)` ou un hash dédié, puis comparer côté application.
- URL announce privée par utilisateur : `/announce/{passkey}`.

### Contrôleur simplifié

Voir `backend/src/main.ts`. Il fait :

1. Parsing brut de `info_hash`/`peer_id`.
2. Vérification du passkey.
3. Vérification du torrent et des droits de download.
4. Calcul des deltas upload/download depuis le dernier announce connu.
5. Mise à jour de `peers`, `users`, `snatch_list`, `announce_events`.
6. Retour de peers en bencode compact ou dictionnaire.

### Gestion de 100 000 peers / 30 min

100 000 peers toutes les 30 minutes = environ 55 annonces/seconde en moyenne, mais il faut dimensionner pour les pics.

Plan robuste :

1. **Announce stateless et court** : aucune logique de forum, pas de rendu, pas d'appel externe.
2. **Cache passkey -> user_id dans Redis** avec TTL court, invalidé à la rotation du passkey.
3. **Cache info_hash -> torrent_id/status dans Redis**.
4. **Écriture chaude dans Redis** :
   - Hash `peer:{torrent_id}:{user_id}:{peer_id}` avec TTL 45-60 min.
   - Sorted set `torrent:{id}:seeders` et `torrent:{id}:leechers`.
   - Stream Redis `announce:events` pour audit asynchrone.
5. **Flush SQL agrégé** toutes les 30-60 secondes : addition des deltas par utilisateur/torrent.
6. **PostgreSQL pour vérité durable**, Redis pour présence et compteurs chauds.
7. **Partitionner les journaux** (`announce_events_2026_05`, etc.).
8. **Limiter random ORDER BY** : pré-calculer des échantillons de peers dans Redis au lieu de `ORDER BY random()` en production.
9. **PgBouncer** devant PostgreSQL en transaction pooling.
10. **Endpoint announce séparé** sur autoscaling horizontal.

## 4. Recherche full-text

### Meilisearch recommandé pour le sandbox

Meilisearch est simple, rapide, typo-tolérant et agréable pour un moteur de recherche de torrents. Elasticsearch devient plus pertinent si vous avez besoin de scoring très personnalisé, pipelines d'ingestion complexes, analyseurs linguistiques avancés, agrégations lourdes et observabilité plus profonde.

Index `torrents` :

```json
{
  "searchableAttributes": ["name", "description", "category", "files"],
  "filterableAttributes": ["category", "status", "size_bytes", "created_at"],
  "sortableAttributes": ["created_at", "size_bytes", "seeders", "leechers", "completed_count"],
  "synonyms": {
    "vf": ["francais", "français"],
    "vostfr": ["sous-titres français", "sub french"],
    "doc": ["document", "pdf"]
  }
}
```

Le script `backend/src/search/reindex-demo.ts` indexe les torrents approuvés et leurs fichiers.

### Indexer les fichiers contenus dans les torrents

Lors de l'upload `.torrent` :

1. Parser le bencode du fichier `.torrent`.
2. Lire `info.files[]` pour les torrents multi-fichiers ou `info.name`/`info.length` pour les torrents mono-fichier.
3. Stocker chaque chemin dans `torrent_files`.
4. Ajouter au document Meilisearch un champ `files: string[]`.
5. Ne pas afficher automatiquement des chemins sensibles si les torrents sont privés/personnels ; utiliser un mode “indexable” explicite.

## 5. Intégration P2P & sécurité

### Transmission / qBittorrent

Objectif : faciliter le ré-upload légal d'un fichier déjà présent chez l'utilisateur.

Pattern recommandé :

```text
Frontend -> API sandbox -> client local Transmission/qBittorrent via token local -> ajout torrent/magnet -> vérification -> seed
```

Ne jamais exposer directement le RPC du client torrent sur Internet.

Transmission :

- API RPC JSON.
- Authentification HTTP basic fréquente : imposer HTTPS ou localhost uniquement.
- Méthodes utiles : `torrent-add`, `torrent-get`, `torrent-start`, `torrent-verify`.

qBittorrent :

- Web API HTTP.
- Login par cookie de session.
- Méthodes utiles : `/api/v2/torrents/add`, `/api/v2/torrents/info`, `/api/v2/torrents/recheck`, `/api/v2/torrents/resume`.

### Anti comptes dupliqués sans service tiers invasif

Approche respectueuse : scoring de risque, pas blocage brutal automatique.

Signaux peu invasifs :

- IP /24 ou ASN approximatif, sans conserver l'IP complète plus longtemps que nécessaire.
- Historique d'invitations : arbre d'invitation, grappes suspectes.
- Recyclage de passkeys, emails jetables, activité impossible.
- Device token volontaire stocké en cookie signé, rotatif, non publicitaire.
- Vitesse d'annonce et overlap d'usage entre comptes.
- Empreinte navigateur minimale et éphémère : user-agent majeur, fuseau horaire, langue, tailles d'écran grossières, TTL court.

À éviter : canvas fingerprinting agressif, audio fingerprinting, tracking cross-site, achat de données tierces.

### Anti-triche ratio

Règles de détection :

- Deltas négatifs ou reset de compteurs non expliqué.
- Upload crédité alors qu'aucun leecher actif n'existe.
- Upload impossible par rapport à la durée depuis le dernier announce.
- Même `peer_id` utilisé sur trop d'IP ou trop de torrents simultanés.
- Client interdit ou peer_id incohérent.
- `completed` sans progression cohérente du `left`.
- Ratios torrent par torrent impossibles : par exemple 200× la taille du torrent en quelques minutes.

Réponse recommandée : journaliser, geler le crédit suspect, augmenter `risk_score`, demander revue modérateur.

## 6. Code fourni

Arborescence :

```text
.
├── docker-compose.yml
├── sql/001_schema.sql
├── backend/
│   ├── package.json
│   └── src/
│       ├── main.ts
│       ├── bencode.ts
│       ├── announce-utils.ts
│       ├── db.ts
│       ├── seed-bonus.worker.ts
│       └── search/reindex-demo.ts
└── frontend/
    ├── package.json
    └── src/
        ├── App.tsx
        ├── style.css
        └── components/TorrentTable.tsx
```

Commandes utiles :

```bash
# lancer l'environnement
docker compose up

# healthcheck API
curl http://localhost:3000/health

# indexer les torrents approuvés dans Meilisearch
docker compose exec api npm run index:demo

# créditer le seed bonus manuellement
docker compose exec api npx tsx src/seed-bonus.worker.ts
```

## Étapes de durcissement production

- Remplacer les mots de passe par des secrets forts.
- Ajouter migrations versionnées : Sqitch, Prisma migrations, Knex, TypeORM ou Laravel migrations.
- Ajouter PgBouncer.
- Déplacer la présence des peers dans Redis.
- Ajouter queue de flush des deltas.
- Stocker les passkeys sous forme HMAC/hash, pas en clair.
- Ajouter tests d'annonce avec des vrais vecteurs bencode.
- Ajouter parser `.torrent` robuste et validation anti-malware sur les noms de fichiers.
- Séparer domaine web et domaine announce.
- Activer logs structurés sans passkey.
