export default function () {
  let widget = document.createElement("div");
  let progress = document.createElement("div");

  widget.className = "smartmd__upload";
  progress.className = "smartmd__upload__progress";

  widget.appendChild(progress);
  return widget
}
