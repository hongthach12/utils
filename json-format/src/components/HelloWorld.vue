<template>
  <div class="container-fluid">
    <div class="row" style="    min-height: 90vh;">
      <div class="col" style="">
        <textarea
          style="width: 100%; height:100%"
          v-model="content"
          id=""
        ></textarea>
      </div>
      <div class="col-1">
        <button class="btn btn-primary" @click="format">Format >></button>
      </div>
      <div v-html="formatJson" class="col" style="width: 100%;min-height: 90vh;border: 1px solid;text-align: left;" ref="jsonContent">
        
      </div>
    </div>
  </div>
</template>

<script>
import JSONFormatter from "json-formatter-js";

export default {
  name: "HelloWorld",
  data() {
    return {
      content: '{"qwe": 1}',
      formatJson: null
    };
  },
  props: {
    msg: String,
  },
  mounted() {},
  methods: {
    format() {
      const formatter = new JSONFormatter(JSON.parse(this.content), 5);

      // document.body.appendChild(formatter.render());
      this.$refs.jsonContent.appendChild(formatter.render());
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
