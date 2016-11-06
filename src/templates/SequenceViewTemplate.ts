const SequenceViewTemplate: string =
`<div class="button-panel">
    <div class="button-column resize">
        <div class="expand button scale-button">
            <button class="button"></button>
            <i class="fa fa-expand"></i>
        </div>
        <div class="compress button scale-button">
            <button class="button"></button>
            <i class="fa fa-compress"></i>
        </div>
    </div>
    <button class="add-channel button scale-button text-center">+</button>
    <div class="button-column jump">
        <div class="up button scale-button">
            <button class="button"></button>
            <i class="fa fa-chevron-circle-up"></i>
        </div>
        <div class="down button scale-button">
            <button class="button"></button>
            <i class="fa fa-chevron-circle-down"></i>
        </div>
    </div>
</div>
<div id="channel-views"></div>`;

export default SequenceViewTemplate;