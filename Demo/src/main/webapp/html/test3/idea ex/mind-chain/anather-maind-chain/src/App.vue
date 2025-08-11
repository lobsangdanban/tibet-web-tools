<template>
  <div>
    <input v-model="inputValue" placeholder="输入一个或多个字符串，用空格分隔" />
    <button @click="processInput">处理输入</button>
    <v-stage :config="stageConfig">
      <v-layer>
        <v-rect
          v-for="(item, index) in items"
          :key="index"
          :config="item.config"
          @click="handleItemClick(index)"
        />
        <v-line
          v-for="(edge, index) in edges"
          :key="`edge-${index}`"
          :config="edge.config"
        />
      </v-layer>
    </v-stage>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { Stage, Layer, Rect, Line } from 'vue-konva';

export default defineComponent({
  components: {
    VStage: Stage,
    VLayer: Layer,
    VRect: Rect,
    VLine: Line,
  },
  setup() {
    const inputValue = ref('');
    const items = ref([]);
    const edges = ref([]);
    const stageConfig = ref({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const processInput = () => {
      const strings = inputValue.value.split(' ');
      items.value = strings.map(str => ({
        config: {
          x: Math.random() * (stageConfig.value.width - 100),
          y: Math.random() * (stageConfig.value.height - 50),
          width: 100,
          height: 50,
          fill: 'white',
          stroke: 'black',
          strokeWidth: 2,
          text: str,
        },
      }));
      edges.value = [];
    };

    const handleItemClick = (index) => {
      const selectedItem = items.value[index];
      if (selectedItem.config.fill === 'lightblue') {
        selectedItem.config.fill = 'white';
        edges.value = edges.value.filter(edge => !edge.sourceIndex === index && !edge.targetIndex === index);
      } else {
        selectedItem.config.fill = 'lightblue';
        const newEdge = {
          sourceIndex: index,
          targetIndex: (index + 1) % items.value.length,
          config: {
            points: [
              items.value[index].config.x + 50,
              items.value[index].config.y + 25,
              items.value[(index + 1) % items.value.length].config.x + 50,
              items.value[(index + 1) % items.value.length].config.y + 25,
            ],
            stroke: 'red',
            strokeWidth: 2,
          },
        };
        edges.value.push(newEdge);
      }
    };

    window.addEventListener('resize', () => {
      stageConfig.value = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    });

    return {
      inputValue,
      items,
      edges,
      stageConfig,
      processInput,
      handleItemClick,
    };
  },
});
</script>