<script lang="ts">
    import "../app.css";
    import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

    let file: File | null | undefined = null;

    let width = -1;
    let height = -1;

    async function convert() {
        if (!validateFile()) {
            return;
        }

        const inputFileName = file!.name;
        const outputFileName: string = inputFileName.replace(/\.([^.]+)$/, '-resized.$1');

        const ffmpeg = createFFmpeg();
        await ffmpeg.load();

        ffmpeg.FS("writeFile", inputFileName, await fetchFile(file!));

        await ffmpeg.run("-i", inputFileName, "-vf", `scale=${width}:${height}`, outputFileName);
        
        const data = await ffmpeg.FS("readFile", outputFileName);

        const linkEl = document.createElement("a");
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
        dropZone.classList.add("bg-gray-100");
    }

    function onDragLeave(event: DragEvent) {
        if (dropZone.contains(event.relatedTarget as Node)) {
            return;
        }

        dropZone.classList.remove("bg-gray-100");
    }

    function onDrop(event: DragEvent) {
        dropZone.classList.remove("bg-gray-100");

        file = event.dataTransfer?.files?.item(0);

        showPreview();
    }

    function onFileInputChange(event: Event) {
        file = (event.target as HTMLInputElement).files?.item(0);

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
        if (!validateFile()) {
            return;
        }

        previewSection.classList.remove("hidden");
        dropZoneContent.classList.add("hidden");

        previewSection.src = URL.createObjectURL(file!);
    }
</script>

<svelte:head>
    <title>Image Resizer</title>
</svelte:head>

<div class="flex items-center justify-center h-screen w-screen">
    <div class="flex flex-col items-center justify-center w-96">
        <div class="flex justify-center items-center w-full"
        on:dragenter={onDragEnter}
        on:dragleave={onDragLeave}
        on:dragover|preventDefault
        on:drop|preventDefault={onDrop}
        >
            <label for="file-input" class="flex flex-col justify-center items-center w-full h-64 bg-gray-50 rounded-lg border-2 border-gray-300 border-dashed cursor-pointer dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600" bind:this={dropZone}
            >
                <div class="flex flex-col justify-center items-center pt-5 pb-6" bind:this={dropZoneContent}>
                    <svg class="mb-3 w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                    <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload</span> or drag and drop</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Support any type of image.</p>
                </div>
                <input id="file-input" type="file" class="hidden" on:change={onFileInputChange} />
                <img class="hidden w-full h-full object-contain"  src="" alt="" bind:this={previewSection} />
            </label>
        </div> 

        <input type="number" bind:value={width} />
        <input type="number" bind:value={height} />

        <button on:click="{convert}">
            CONVERT
        </button>
    </div>
</div>
