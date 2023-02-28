<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col" style="text-align: left; color: red">
        {{ msg }}
      </div>
    </div>
    <div class="row" style="min-height: 90vh">
      <div class="col" style="">
        <textarea
          style="width: 100%; height: 100%"
          v-model="content"
          id=""
        ></textarea>
      </div>
      <div class="col-1">
        <button class="btn btn-primary" @click="format">Format >></button>
        <button class="btn btn-primary mt-1" @click="minify">Minify</button>
        <button class="btn btn-primary mt-1" @click="clean">Clean</button>
      </div>
      <div
        class="col"
        v-html="formatJson"
        style="
          width: 100%;
          min-height: 90vh;
          border: 1px solid;
          text-align: left;
        "
        ref="jsonContent"
      ></div>
    </div>
  </div>
</template>

<script>
import JSONFormatter from "json-formatter-js";
import jsonminify from "jsonminify";

export default {
  name: "HelloWorld",
  data() {
    return {
      content: '{"qwe": 1}',
      formatJson: null,
      msg: "",
    };
  },
  mounted() {
    this.content = this.load();
  },
  methods: {
    format() {
      if (!this.content) {
        return;
      }
      try {
        const formatter = new JSONFormatter(JSON.parse(this.content), 5);
        this.$refs.jsonContent.replaceChildren();
        this.$nextTick(() => {
          this.$refs.jsonContent.appendChild(formatter.render());
        });
        this.save()
      } catch (error) {
        this.msg = error.message;
      }
      // this.formatJson = formatter.render()
    },
    minify() {
      try {
        this.formatJson = "";
        this.$nextTick(() => {
          // this.$refs.jsonContent.replaceChildren();
          this.formatJson = jsonminify(this.content);
        });
        this.save()
      } catch (error) {
        this.msg = error.message;
      }
      // this.$refs.jsonContent.appendChild(jsonminify(this.content));
    },
    clean() {
      this.content = null;
      this.formatJson = "";
      this.$refs.jsonContent.replaceChildren();
    },
    save() {
      localStorage.setItem('jsonData', this.content);
    },
    load() {
      return localStorage.getItem('jsonData') || "";
    }
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
