var map = new wemapgl.WeMap({
  container: "map",
  key: "GqfwrZUEfxbwbnQUhtBMFivEysYIxelQ",
  center: [105.1, 21.0],
  zoom: 5,
  // Turn on urlController
  urlController: "false",
  // Turn on reverse
  reverse: "false",
});

map.on("load", function () {
  if (map.getSource("data") != undefined) {
    map.removeLayer("state-fills");
    map.removeSource("data");
  }

  map.addSource("data", {
    type: "geojson",
    data: "http://127.0.0.1:8080/Downloads/data.geojson",
  });

  map.addLayer({
    id: "state-fills",
    type: "fill",
    source: "data",
    layout: {},
    paint: {
      "fill-color": {
        property: "total",
        stops: [
          [-4, "#42f5cb"],
          [-3, "#a5ff7d"],
          [-2, "#fcf988"],
          [-1, "#ffca7a"],
          [0, "#e6f0ef"],
        ],
      },
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        1,
        0.5,
      ],
      "fill-outline-color": "#000",
    },
  });

  // map.addLayer({
  //   id: "state-borders",
  //   type: "line",
  //   source: "data",
  //   layout: {},
  //   paint: {
  //     "line-color": "#627BC1",
  //     "line-width": 2,
  //   },
  // });

  // When the user moves their mouse over the state-fill layer, we'll update the
  // feature state for the feature under the mouse.
  var hoveredStateId = null;
  map.on("mousemove", "state-fills", (e) => {
    if (e.features.length > 0) {
      if (hoveredStateId !== null) {
        map.setFeatureState(
          { source: "data", id: hoveredStateId },
          { hover: false }
        );
      }
      hoveredStateId = e.features[0].properties.id_1;
      map.setFeatureState(
        { source: "data", id: hoveredStateId },
        { hover: true }
      );
    }
  });

  map.on("mouseleave", "state-fills", (e) => {
    setCursor("");
    popup.remove();
  });

  map.on("click", "state-fills", (e) => {
    let province = e.features[0].properties.name;
    console.log(province);
    if (
      province === "Bình Định" ||
      province === "Ninh Thuận" ||
      province === "Quảng Nam" ||
      province === "Quảng Ngãi"
    ) {
      showInfoModal(province);
    } else {
      alertModal.show();
    }
  });

  function setCursor(style) {
    map.getCanvas().style.cursor = style;
  }

  function parseTabContent(data) {
    var keys = Object.keys(data);

    var content = "<div>";

    for (let i = 0; i < keys.length; i++) {
      let p = data[keys[i]];
      content += `<h5>${keys[i]}</h5><p>${
        typeof p === "object" ? parseTabContent(p) : p
      }</p>`;
    }

    content += "</div>";

    return content;
  }

  function buildModal(data) {
    var tabs = document.getElementById("pills-tab");
    var tabsContent = document.getElementById("pills-tabContent");

    var keys = Object.keys(data);

    document.getElementById("informationModalLabel").innerText = data[keys[0]];

    tabs.innerHTML = "";
    tabsContent.innerHTML = "";

    for (let i = 1; i < keys.length; i++) {
      tabs.innerHTML += `<li class="nav-item" role="presentation"><button class="nav-link" id="pills-${i}-tab" data-bs-toggle="pill" data-bs-target="#pills-${i}" type="button" role="tab" aria-controls="pills-${i}" aria-selected="true">${keys[i]}</button></li>`;
      tabsContent.innerHTML += `<div class="tab-pane fade" id="pills-${i}" role="tabpanel" aria-labelledby="pills-${i}-tab">${parseTabContent(
        data[keys[i]]
      )}</div>`;
    }

    tabs.firstChild.firstChild.classList.add("active");
    tabsContent.firstChild.classList.add("show");
    tabsContent.firstChild.classList.add("active");
  }

  var informationModal = new bootstrap.Modal(
    document.getElementById("informationModal")
  );

  var alertModal = new bootstrap.Modal(document.getElementById("alertModal"));

  function showInfoModal(name) {
    fetch("/data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: name }),
    })
      .then((response) => response.json())
      .then((data) => {
        buildModal(data[0]);

        informationModal.show();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
});
