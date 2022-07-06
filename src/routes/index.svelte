<script lang="ts">
    import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

    let file: FileList | null = null;

    let width = -1;
    let height = -1;

    async function convert() {
        console.log(crossOriginIsolated);

        if (file?.item(0) == null) {
            return;
        }
        const input_file_name = file!.item(0)!.name;
        const output_file_name: string = "resized-" + input_file_name

        const ffmpeg = createFFmpeg();
        await ffmpeg.load();

        ffmpeg.FS("writeFile", input_file_name, await fetchFile(file!.item(0)!));

        await ffmpeg.run("-i", input_file_name, "-vf", `scale=${width}:${height}`, output_file_name);
        
        const data = await ffmpeg.FS("readFile", output_file_name);

        const linkEl = document.createElement("a");
        linkEl.href = URL.createObjectURL(
            new Blob([data.buffer], { 
                type: "image/png" 
            })
        );
        linkEl.download = output_file_name;
        linkEl.click();
    }
</script>

<input type="file" bind:files={file} />

<input type="number" bind:value={width} />
<input type="number" bind:value={height} />

<button on:click="{convert}">
    CONVERT
</button>

<style>
</style>
