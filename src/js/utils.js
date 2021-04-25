export function createButton(scene, text){
    return scene.rexUI.add.label({
        width: 40,
        height: 40,
        background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 2, 0xb4b4b4),
        text: scene.add.text(0, 0, text, {
            fontSize: "32px"
        }),
        space: {
            left: 12,
            right: 12,
        },
        align: "center"
    });
}