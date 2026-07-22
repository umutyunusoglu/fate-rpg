import OBR from "@owlbear-rodeo/sdk";

const SHEET_MODAL_ID = "com.fate-rpg.fate-sheets/sheet-modal";

export async function openSheetModal(characterId: string): Promise<void> {
  const url = new URL("modal.html", window.location.href);
  url.searchParams.set("id", characterId);
  await OBR.modal.open({
    id: SHEET_MODAL_ID,
    url: url.toString(),
    width: 720,
    height: 680,
  });
}

export async function openImportModal(): Promise<void> {
  const url = new URL("modal.html", window.location.href);
  url.searchParams.set("mode", "import");
  await OBR.modal.open({
    id: SHEET_MODAL_ID,
    url: url.toString(),
    width: 720,
    height: 680,
  });
}

export async function closeSheetModal(): Promise<void> {
  await OBR.modal.close(SHEET_MODAL_ID);
}
