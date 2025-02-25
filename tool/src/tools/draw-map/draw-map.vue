<template>
  <n-card>
    <n-space justify="center">
      <n-button secondary autofocus @click="draw"> Draw </n-button>
    </n-space>
    <br />
    <n-input
      ref="inputElement"
      v-model:value="input"
      placeholder="Paste your raw json here..."
      type="textarea"
      rows="20"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
    />
    <n-input
      ref="inputElement"
      v-model:value="input2"
      placeholder="Paste your raw json here..."
      type="textarea"
      rows="20"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
    />
  </n-card>
  <n-card>
    <GoogleMap
      api-key="AIzaSyAJLOLG8xVaBBr2hN4W8wRQrHHgCpuROQ4"
      style="width: 100%; height: 500px"
      :center="center"
      :zoom="15"
      :ref="map1"
    >
      <!-- <Marker :options="{ position: center }" /> -->
      <Polyline :options="flightPath" />

    </GoogleMap>
    <GoogleMap
      api-key="AIzaSyAJLOLG8xVaBBr2hN4W8wRQrHHgCpuROQ4"
      style="width: 100%; height: 500px"
      :center="center"
      :zoom="15"
    >
      <Polyline :options="flightPath2" />

      <!-- <Marker :options="{ position: center }" /> -->
    </GoogleMap>
  </n-card>
</template>

<script setup lang="ts">
import { GoogleMap, Marker, Polyline } from 'vue3-google-map';
import { computed, ref } from 'vue';

let center = ref({ lat: 34.6875702, lng:135.514655 });

const map1 = ref<HTMLElement>();
const input = ref();
const input2 = ref();

let coordinates = [
  // { lat: 37.772, lng: -122.214 },
]
let coordinates2 = [
  // { lat: 37.772, lng: -122.214 },
]
let flightPath = ref({
  path: coordinates,
  geodesic: true,
  strokeColor: '#FF0000',
  strokeOpacity: 1.0,
  strokeWeight: 2,
})

let flightPath2 = ref({
  path: coordinates,
  geodesic: true,
  strokeColor: '#FF0000',
  strokeOpacity: 1.0,
  strokeWeight: 2,
})


function draw() {
  if (!(input.value && input2.value)) {
    alert('Input json input 1 and input 2')
  }
  const jsonInput = JSON.parse(input.value);
  coordinates = jsonInput.map((item: any) => {
    return { lat: item.lat, lng: item.lon }
  });
  // console.log(coordinates, map1);
  center.value = coordinates[0];

  flightPath.value = {
    ...flightPath.value,
    path: coordinates,
  }


  const jsonInput2 = JSON.parse(input2.value);
  coordinates2 = jsonInput2.map((item: any) => {
    return { lat: item.lat, lng: item.lon }
  });
  // console.log(coordinates, map1);
  // center = coordinates[0];

  flightPath2.value = {
    ...flightPath.value,
    path: coordinates2,
  }
}
</script>
<style lang="less" scoped>
</style>