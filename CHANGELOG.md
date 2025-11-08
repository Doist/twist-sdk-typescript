# Changelog

## [1.1.0](https://github.com/Doist/twist-sdk-typescript/compare/v1.0.0...v1.1.0) (2025-11-08)


### Features

* add custom fetch support and refactor to named parameters ([#46](https://github.com/Doist/twist-sdk-typescript/issues/46)) ([ccf2646](https://github.com/Doist/twist-sdk-typescript/commit/ccf2646df82d6987a5ed774b2ec91109e800a978))
* add dual module support (CommonJS + ESM) ([#50](https://github.com/Doist/twist-sdk-typescript/issues/50)) ([d5929c6](https://github.com/Doist/twist-sdk-typescript/commit/d5929c67ae581242a6ea6ab16c418c8bc149e23a))
* Add missing endpoints ([6434b1e](https://github.com/Doist/twist-sdk-typescript/commit/6434b1ee27bf055a636f9faea8d98b4db3a362dc))
* add Release Please automation for automated releases ([#51](https://github.com/Doist/twist-sdk-typescript/issues/51)) ([7ac8533](https://github.com/Doist/twist-sdk-typescript/commit/7ac85334ed9146eaee034839253119a8256f395d))
* Adds support for making batch calls.  ([#25](https://github.com/Doist/twist-sdk-typescript/issues/25)) ([788fab6](https://github.com/Doist/twist-sdk-typescript/commit/788fab69f5dc732f5c7e42744f74442d461d1548))
* enhance batch API with automatic chunking and parallel execution ([#41](https://github.com/Doist/twist-sdk-typescript/issues/41)) ([fde634c](https://github.com/Doist/twist-sdk-typescript/commit/fde634ccdacc6830f48c2f6fef6489fd498decb2))
* Enhance conversation and thread clients with unread entities and schemas ([9cc7ddb](https://github.com/Doist/twist-sdk-typescript/commit/9cc7ddbdbc90f45f69385b0d08b1376cffe48111))
* implement URL helper functions and tests for generating Twist URLs ([#23](https://github.com/Doist/twist-sdk-typescript/issues/23)) ([19ab28a](https://github.com/Doist/twist-sdk-typescript/commit/19ab28a923c67786788d020b16b0b30192c54887))
* Initial check-in ([c80474b](https://github.com/Doist/twist-sdk-typescript/commit/c80474ba589917caaef3af84e9c230ab948f58b5))


### Bug Fixes

* add obsidian devDependency and enable Obsidian integration tests ([#49](https://github.com/Doist/twist-sdk-typescript/issues/49)) ([888d1f3](https://github.com/Doist/twist-sdk-typescript/commit/888d1f3289b5d898438b8905588c07329ce16d70))
* **deps:** update dependency camelcase to v8 ([#21](https://github.com/Doist/twist-sdk-typescript/issues/21)) ([b0eb368](https://github.com/Doist/twist-sdk-typescript/commit/b0eb36826a8422dc11c7e224c497ca79c90dcd15))
* **deps:** update dependency zod to v4.1.12 ([#24](https://github.com/Doist/twist-sdk-typescript/issues/24)) ([8577217](https://github.com/Doist/twist-sdk-typescript/commit/8577217aa774b47d295bc7781ab9e4b77349922d))
* **deps:** update docusaurus monorepo to v3.9.1 ([#13](https://github.com/Doist/twist-sdk-typescript/issues/13)) ([f99efee](https://github.com/Doist/twist-sdk-typescript/commit/f99efee860c2a04aa58f9b2e30af29bb0ce54db5))
* **deps:** update docusaurus monorepo to v3.9.2 ([#37](https://github.com/Doist/twist-sdk-typescript/issues/37)) ([118ef0c](https://github.com/Doist/twist-sdk-typescript/commit/118ef0c56b2be99381a2c8dbc9a44d3b93ecf82c))
* No non-null assertions ([ecb4f41](https://github.com/Doist/twist-sdk-typescript/commit/ecb4f410b765790c25932213a439eb19c54e828c))


### Code Refactoring

* centralize base URL management and fix trailing slash bug ([#40](https://github.com/Doist/twist-sdk-typescript/issues/40)) ([4305904](https://github.com/Doist/twist-sdk-typescript/commit/4305904a8a2f96316500c819f5ea7f5f2654446e))
* Rename Permissions to Scopes ([82d667b](https://github.com/Doist/twist-sdk-typescript/commit/82d667b07418e7e79d6375fcb6bbab10afc2a41d))
* Switch to using named params for &gt; 2 params ([#32](https://github.com/Doist/twist-sdk-typescript/issues/32)) ([47b781a](https://github.com/Doist/twist-sdk-typescript/commit/47b781a9418268ed25a3f7077721f877de0bc7eb))
* Switch to vitest instead of jest ([a68e96a](https://github.com/Doist/twist-sdk-typescript/commit/a68e96ae28f08b8c54259cc10f5c377e9c8be8a3))
* Use a base user schema ([#30](https://github.com/Doist/twist-sdk-typescript/issues/30)) ([0495f2d](https://github.com/Doist/twist-sdk-typescript/commit/0495f2d3af514bb9c2bf9962cecfdb558eee59a4))
* Use MSW for the tests ([b1b8730](https://github.com/Doist/twist-sdk-typescript/commit/b1b8730da6ddf235f23807f8ad93639110b27cd4))


### Miscellaneous

* Add authorisation docs ([c649ceb](https://github.com/Doist/twist-sdk-typescript/commit/c649cebf9d100b12bae728e4931bcc6db838b482))
* Add ci workflows ([e098e47](https://github.com/Doist/twist-sdk-typescript/commit/e098e47616e1e4f36bcd6cd40b59c677177f2572))
* Add documentation website ([0a1b97e](https://github.com/Doist/twist-sdk-typescript/commit/0a1b97e7cb192cdf0b4de6cc34497913e7a5db50))
* Add renovate.json ([00aae46](https://github.com/Doist/twist-sdk-typescript/commit/00aae4637657fb38132698621cf8137a1b19f93c))
* Adds additional clients, updates date params ([6bd3bbd](https://github.com/Doist/twist-sdk-typescript/commit/6bd3bbdfa13db1f18c0fecb1da1cfa415c471e78))
* Adds better type documentation ([6f15d8e](https://github.com/Doist/twist-sdk-typescript/commit/6f15d8eaf9cb08908a077292238a3aebe2988173))
* Adds jsdocs to the codebase ([a158e44](https://github.com/Doist/twist-sdk-typescript/commit/a158e442a69c2b956dead1fd2491016f012851b4))
* Adds readme ([8099ea3](https://github.com/Doist/twist-sdk-typescript/commit/8099ea38a47c1732c8fceda3ba6d21108b65f4a7))
* Better handling for ESM ([12e948f](https://github.com/Doist/twist-sdk-typescript/commit/12e948f28415715fb56dc09de9f972cffbd16fd8))
* Bump version and add github publishing ([90e7249](https://github.com/Doist/twist-sdk-typescript/commit/90e724966d4c974c11901c3bf4dda66ec2bf5c05))
* Bump version to 0.1.0-alpha.2 ([e6e8797](https://github.com/Doist/twist-sdk-typescript/commit/e6e8797dad1d520205834a7ef324e0c5ad3c566a))
* Bump version to 0.1.0-alpha.4 ([02ce558](https://github.com/Doist/twist-sdk-typescript/commit/02ce558fa328f32c7b78c065ff109a2f06467ed4))
* Bump version to 0.1.0-alpha.5 ([d4a5dbb](https://github.com/Doist/twist-sdk-typescript/commit/d4a5dbb8d149099ab18b66a4a6408ffa76668173))
* Correct the auth scopes ([416de8c](https://github.com/Doist/twist-sdk-typescript/commit/416de8c2a7bbc0dde51bb930c248e31c42cb2505))
* **deps-dev:** bump vite from 7.1.9 to 7.1.11 ([#38](https://github.com/Doist/twist-sdk-typescript/issues/38)) ([a8e7145](https://github.com/Doist/twist-sdk-typescript/commit/a8e7145f522f3e04b0df77c6b7609e087c91bb54))
* **deps:** update actions/setup-node action to v6 ([#36](https://github.com/Doist/twist-sdk-typescript/issues/36)) ([460f855](https://github.com/Doist/twist-sdk-typescript/commit/460f855c5c08903602600da6cb8428781244c45a))
* **deps:** update actions/upload-pages-artifact action to v4 ([#14](https://github.com/Doist/twist-sdk-typescript/issues/14)) ([1856aa8](https://github.com/Doist/twist-sdk-typescript/commit/1856aa8b6c96d7b6b83ec69c7eaa130040919519))
* **deps:** update dependency @biomejs/biome to v2.2.5 ([#3](https://github.com/Doist/twist-sdk-typescript/issues/3)) ([6be561e](https://github.com/Doist/twist-sdk-typescript/commit/6be561e2704293c22521afbc8bcf93eef593d07f))
* **deps:** update dependency @biomejs/biome to v2.3.1 ([#35](https://github.com/Doist/twist-sdk-typescript/issues/35)) ([661297a](https://github.com/Doist/twist-sdk-typescript/commit/661297af0f434bdcfba91cfd88f9c89ae88971fc))
* **deps:** update dependency @types/uuid to v9.0.8 ([#5](https://github.com/Doist/twist-sdk-typescript/issues/5)) ([109fa22](https://github.com/Doist/twist-sdk-typescript/commit/109fa2280e0d709f6ef6804a36b231620173a78b))
* **deps:** update dependency husky to v9 ([#16](https://github.com/Doist/twist-sdk-typescript/issues/16)) ([e4a3a2a](https://github.com/Doist/twist-sdk-typescript/commit/e4a3a2a2fc070ab09353d535a3be21ea24fed190))
* **deps:** update dependency lint-staged to v13.3.0 ([#10](https://github.com/Doist/twist-sdk-typescript/issues/10)) ([3adbbf2](https://github.com/Doist/twist-sdk-typescript/commit/3adbbf2d1240cb00f9164edb1e5f46153160ca09))
* **deps:** update dependency lint-staged to v16 ([#17](https://github.com/Doist/twist-sdk-typescript/issues/17)) ([cb8d46c](https://github.com/Doist/twist-sdk-typescript/commit/cb8d46cce2ed429353e93b857ae6006461b7a215))
* **deps:** update dependency msw to v2.11.6 ([#28](https://github.com/Doist/twist-sdk-typescript/issues/28)) ([a94c814](https://github.com/Doist/twist-sdk-typescript/commit/a94c81402e60af2edbeb7aa660afc8941a8342a0))
* **deps:** update dependency msw to v2.12.0 ([#45](https://github.com/Doist/twist-sdk-typescript/issues/45)) ([8ff9c2b](https://github.com/Doist/twist-sdk-typescript/commit/8ff9c2beab9fed0ca93497ff6a4d843687fc44a6))
* **deps:** update dependency npm-run-all2 to v5.0.2 ([#6](https://github.com/Doist/twist-sdk-typescript/issues/6)) ([f93c001](https://github.com/Doist/twist-sdk-typescript/commit/f93c001bf016c5c94e86bfc39628292e66336551))
* **deps:** update dependency npm-run-all2 to v8 ([#18](https://github.com/Doist/twist-sdk-typescript/issues/18)) ([7f6ae50](https://github.com/Doist/twist-sdk-typescript/commit/7f6ae50de4db42f9cccbf250317afaaa9546bb13))
* **deps:** update dependency rimraf to v6 ([#19](https://github.com/Doist/twist-sdk-typescript/issues/19)) ([920caf6](https://github.com/Doist/twist-sdk-typescript/commit/920caf6c72fdcbd335db79087adc0169cb6fc075))
* **deps:** update dependency rimraf to v6.1.0 ([#43](https://github.com/Doist/twist-sdk-typescript/issues/43)) ([ad25e7b](https://github.com/Doist/twist-sdk-typescript/commit/ad25e7bffbb2669140c337bdef3ee03fc60bd695))
* **deps:** update dependency ts-node to v10.9.2 ([#7](https://github.com/Doist/twist-sdk-typescript/issues/7)) ([f5faa40](https://github.com/Doist/twist-sdk-typescript/commit/f5faa405ad35240790b0f26535f96fc380884921))
* **deps:** update dependency type-fest to ^4.12.0 || ^5.1.0 ([#34](https://github.com/Doist/twist-sdk-typescript/issues/34)) ([ac98b87](https://github.com/Doist/twist-sdk-typescript/commit/ac98b87ba95fc8580b2de8eb3d57116a9cde31af))
* **deps:** update dependency type-fest to v5 ([#20](https://github.com/Doist/twist-sdk-typescript/issues/20)) ([511b436](https://github.com/Doist/twist-sdk-typescript/commit/511b436cd6f16c0c53fb089f97c4b0f02134086f))
* **deps:** update dependency type-fest to v5.1.0 ([#33](https://github.com/Doist/twist-sdk-typescript/issues/33)) ([fcb5c64](https://github.com/Doist/twist-sdk-typescript/commit/fcb5c64c3a3f503a2f4cdf132c3e7f8e7b2b8ffa))
* **deps:** update dependency type-fest to v5.2.0 ([#44](https://github.com/Doist/twist-sdk-typescript/issues/44)) ([e9ee590](https://github.com/Doist/twist-sdk-typescript/commit/e9ee59074c633eefe338f239c03ba06e1d9a5a2b))
* **deps:** update dependency typedoc to v0.28.13 ([#8](https://github.com/Doist/twist-sdk-typescript/issues/8)) ([3cf5d91](https://github.com/Doist/twist-sdk-typescript/commit/3cf5d91eaa6052eafa493f94b04efeffba40251b))
* **deps:** update dependency typedoc to v0.28.14 ([#29](https://github.com/Doist/twist-sdk-typescript/issues/29)) ([9a6b16e](https://github.com/Doist/twist-sdk-typescript/commit/9a6b16ee623228ae9c0b601bb4bc13ad775ff968))
* **deps:** update dependency typedoc-plugin-markdown to v4.9.0 ([#11](https://github.com/Doist/twist-sdk-typescript/issues/11)) ([83a9600](https://github.com/Doist/twist-sdk-typescript/commit/83a9600d2b2ee7f22b15a0e23e945210ed3f03f3))
* **deps:** update dependency typedoc-plugin-zod to v1.4.3 ([#31](https://github.com/Doist/twist-sdk-typescript/issues/31)) ([0d70f16](https://github.com/Doist/twist-sdk-typescript/commit/0d70f1646368081fe752a453735f77d18bdcb6ba))
* **deps:** update dependency typescript to v5.9.3 ([#9](https://github.com/Doist/twist-sdk-typescript/issues/9)) ([4a5df7f](https://github.com/Doist/twist-sdk-typescript/commit/4a5df7f87fb3de947bc6593f7a032a6b557b0359))
* **deps:** update react monorepo to v19.2.0 ([#12](https://github.com/Doist/twist-sdk-typescript/issues/12)) ([503b3de](https://github.com/Doist/twist-sdk-typescript/commit/503b3de2204f874f0cfb6b7abc76c6103d4f144c))
* Ensure that cjs and mjs distributions are included in the package ([b2772b0](https://github.com/Doist/twist-sdk-typescript/commit/b2772b0545c6342506206396cac39b90fcd69cb8))
* Ensure the publish workflow will publish prerelease ([715c648](https://github.com/Doist/twist-sdk-typescript/commit/715c648871f996e3e55257f73f6164efb434bdbb))
* Fix entity types ([5b45806](https://github.com/Doist/twist-sdk-typescript/commit/5b45806d3d2c1a58e35a0b07251c72045f8c33d7))
* Fixes the search functions ([f383130](https://github.com/Doist/twist-sdk-typescript/commit/f383130fc0e1f162407ce565762a43b67212e4d8))
* Have the SDK deal with dates, not timestamps ([f4836dd](https://github.com/Doist/twist-sdk-typescript/commit/f4836dd641fd747cac4627bae5c356c0d648a4c2))
* Internalise the case conversion functions ([123ee01](https://github.com/Doist/twist-sdk-typescript/commit/123ee019bf2bae99d811be0a4789c2da3175f16b))
* Lint fix ([0f00788](https://github.com/Doist/twist-sdk-typescript/commit/0f0078841016647f7db11afb4b601d539b3b3197))
* Lint fix ([3888a3b](https://github.com/Doist/twist-sdk-typescript/commit/3888a3baeeeb52337db294854db1f61b91c2b60b))
* Lint fix ([71716ed](https://github.com/Doist/twist-sdk-typescript/commit/71716ed668d2737d429c51f2c3aa3b77b0df7f75))
* Make this an alpha version ([cfd8047](https://github.com/Doist/twist-sdk-typescript/commit/cfd8047f7c2fc84f346692ca4050f589f68a8192))
* Reduce package size ([#27](https://github.com/Doist/twist-sdk-typescript/issues/27)) ([29e40d5](https://github.com/Doist/twist-sdk-typescript/commit/29e40d58b90265927011461773aa9eaa0b94cb36))
* Remvoe test files from published package ([#26](https://github.com/Doist/twist-sdk-typescript/issues/26)) ([492a9f8](https://github.com/Doist/twist-sdk-typescript/commit/492a9f8e2aef6b728558d511f059e47700360885))
* Reverted the cjs+esm package output ([ab3b179](https://github.com/Doist/twist-sdk-typescript/commit/ab3b1798d3f52a4ca108ba5bd3cc02255789fb3b))
* Sort sidebar out ([4bd6ea8](https://github.com/Doist/twist-sdk-typescript/commit/4bd6ea832da664908b1d6dbedfd5abf912b33a6e))
* Switch to biomejs ([d9db933](https://github.com/Doist/twist-sdk-typescript/commit/d9db93389a549ff1fdeea17ffc06c7aa8d4767a6))
* Update biome json schema ([4b97c5c](https://github.com/Doist/twist-sdk-typescript/commit/4b97c5c66f8d049043d311ebd2b77c949e52856e))
* Update docs ([bf1d356](https://github.com/Doist/twist-sdk-typescript/commit/bf1d35664b6a504f47b7a2a8451c3a52acb35bf7))
* Update entities ([1ec7ba5](https://github.com/Doist/twist-sdk-typescript/commit/1ec7ba54ecb07e7dad99d759116c09c8efa614c5))
* Update npm token in publish action ([17d2982](https://github.com/Doist/twist-sdk-typescript/commit/17d2982bb5e3f5639e2edfa6f6d866c31c922899))
* Update repository url ([549cfed](https://github.com/Doist/twist-sdk-typescript/commit/549cfed88bf42132adf18c4979f34656ede4562d))
* Update repository url, again ([4477f48](https://github.com/Doist/twist-sdk-typescript/commit/4477f48340e413051c64eab3962858c0994b013c))
* vs code settings ([d1df42d](https://github.com/Doist/twist-sdk-typescript/commit/d1df42de2281f735c154db27b9c6934058362bd5))

## Changelog
