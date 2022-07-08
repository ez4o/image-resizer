<script lang="ts">
	import '../app.css';
	import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

	let file: File | null | undefined = null;

	let width = -1;
	let height = -1;

	$: canConvert = false;

	async function convert() {
		if (!validateFile()) {
			return;
		}

		const inputFileName = file!.name;
		const outputFileName: string = inputFileName.replace(/\.([^.]+)$/, '-resized.$1');

		const ffmpeg = createFFmpeg();
		await ffmpeg.load();

		ffmpeg.FS('writeFile', inputFileName, await fetchFile(file!));

		await ffmpeg.run('-i', inputFileName, '-vf', `scale=${width}:${height}`, outputFileName);

		const data = await ffmpeg.FS('readFile', outputFileName);

		const linkEl = document.createElement('a');
		linkEl.href = URL.createObjectURL(
			new Blob([data.buffer], {
				type: file!.type
			})
		);
		linkEl.download = outputFileName;
		linkEl.click();
	}

	let dropZone: HTMLElement;
	let dropZoneContent: HTMLElement;
	let previewSection: HTMLImageElement;

	function onDragEnter() {
		dropZone.classList.add('bg-gray-100');
	}

	function onDragLeave(event: DragEvent) {
		if (dropZone.contains(event.relatedTarget as Node)) {
			return;
		}

		dropZone.classList.remove('bg-gray-100');
	}

	function onDrop(event: DragEvent) {
		dropZone.classList.remove('bg-gray-100');

		file = event.dataTransfer?.files?.item(0);

		canConvert = validateFile();
		if (!canConvert) {
			return;
		}

		showPreview();
	}

	function onFileInputChange(event: Event) {
		file = (event.target as HTMLInputElement).files?.item(0);

		canConvert = validateFile();
		if (!canConvert) {
			return;
		}

		showPreview();
	}

	function validateFile(): boolean {
		if (file === null || file === undefined) {
			return false;
		}

		if (!file.type.startsWith('image/')) {
			return false;
		}

		return true;
	}

	function showPreview() {
		previewSection.classList.remove('hidden');
		dropZoneContent.classList.add('hidden');

		previewSection.src = URL.createObjectURL(file!);
	}
</script>

<svelte:head>
	<title>Image Resizer</title>
</svelte:head>

<div
	class="flex items-center justify-center w-screen h-screen bg-gradient-to-r from-orange-600 via-red-500 to-pink-400"
>
	<div
		class="flex flex-col items-center justify-center w-[calc(min(48rem,100%))] h-128 bg-white rounded-2xl shadow-2xl p-6"
	>
		<div
			class="flex justify-center items-center w-full h-full"
			on:dragenter={onDragEnter}
			on:dragleave={onDragLeave}
			on:dragover|preventDefault
			on:drop|preventDefault={onDrop}
		>
			<label
				for="file-input"
				class="flex flex-col justify-center items-center w-full h-full bg-gray-50 rounded-lg border-2 border-gray-300 border-dashed cursor-pointer dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
				bind:this={dropZone}
			>
				<div
					class="flex flex-col justify-center items-center pt-5 pb-6"
					bind:this={dropZoneContent}
				>
					<svg
						class="mb-3 w-10 h-10 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
						/></svg
					>
					<p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
						<span class="font-semibold">Click to upload</span> or drag and drop
					</p>
					<p class="text-xs text-gray-500 dark:text-gray-400">Support any type of image.</p>
				</div>
				<input id="file-input" type="file" class="hidden" on:change={onFileInputChange} />
				<img class="hidden h-96 object-scale-down" src="" alt="" bind:this={previewSection} />
			</label>
		</div>

		<div class="flex flex-row flex-wrap mt-6 w-full">
			<div class="flex-1 mr-4" data-tooltip="width (-1 means to the keep aspect ratio)">
				<input
					class="shadow-md rounded px-2 py-2 border-2 border-gray-300 bg-gray-50 w-full"
					type="number"
					bind:value={width}
				/>
			</div>
			<div class="flex-1 mr-4" data-tooltip="height (-1 means to the keep aspect ratio)">
				<input
					class="shadow-md rounded px-2 py-2 border-2 border-gray-300 bg-gray-50  w-full"
					type="number"
					bind:value={height}
				/>
			</div>

			<button
				class="flex-1 shadow-md bg-gradient-to-l from-orange-600 via-red-500 to-pink-400 opacity-90 text-white font-bold py-2 px-4 rounded"
				class:opacity-40={!canConvert}
				class:hover:opacity-100={canConvert}
				disabled={!canConvert}
				on:click={convert}
			>
				CONVERT
			</button>
		</div>
	</div>
</div>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

    * {
        font-family: 'Montserrat', sans-serif;
    }

	[data-tooltip] {
		position: relative;
		z-index: 2;
		display: block;
	}

	[data-tooltip]:before,
	[data-tooltip]:after {
		visibility: hidden;
		opacity: 0;
		pointer-events: none;
		transition: 0.2s ease-out;
		transform: translate(-50%, 5px);
	}

	[data-tooltip]:before {
		position: absolute;
		bottom: 100%;
		left: 50%;
		margin-bottom: 5px;
		padding: 7px;
		width: 100%;
		-webkit-border-radius: 3px;
		-moz-border-radius: 3px;
		border-radius: 3px;
		background-color: #444c;
		color: #fff;
		content: attr(data-tooltip);
		text-align: center;
		font-size: 14px;
		line-height: 1.5;
		transition: 0.2s ease-out;
	}

	[data-tooltip]:after {
		position: absolute;
		bottom: 100%;
		left: 50%;
		width: 0;
		border-top: 5px solid #444c;
		border-right: 5px solid transparent;
		border-left: 5px solid transparent;
		content: "";
		font-size: 0;
		line-height: 0;
	}

	[data-tooltip]:hover:before,
	[data-tooltip]:hover:after {
		visibility: visible;
		opacity: 1;
		transform: translate(-50%, 0);
	}
</style>
