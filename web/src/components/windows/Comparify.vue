<!-- taken from https://vuejsexamples.com/responsive-image-content-comparison-slider-built-with-vue/ -->
<template>
  <div class="compare-wrapper">
    <div class="compare">
      <div class="compare__content" :style="{ width: width }">
        <slot name="first"></slot>
      </div>

      <div
        class="handle-wrap"
        :style="{
          left: `calc(${compareWidth + '%'} - var(--handle-line-width) / 2 `,
        }"
      >
        <div class="handle">
          <svg
            class="handle__arrow handle__arrow--l feather feather-chevron-left"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <svg
            class="handle__arrow handle__arrow--r feather feather-chevron-right"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
        <span class="handle-line"></span>
      </div>

      <div
        class="compare-overlay "
        :style="{ width: `calc(${compareWidth + '%'})` }"
      >
        <div class="compare-overlay__content" :style="{ width: width }">
          <slot name="second"></slot>
        </div>
      </div>
    </div>
    <input
      type="range"
      min="0"
      max="100"
      :step="step"
      class="compare__range"
      :value="compareWidth"
      @input="handleInput"
      tabindex="-1"
    />
  </div>
</template>

<script>
export default {
  name: "comparify",
  props: {
    value: { default: 50 },
    step: { default: ".1" },
  },
  data() {
    return {
      width: null,
      compareWidth: this.value,
    };
  },
  watch: {
    value() {
      this.compareWidth = this.value;
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.handleResize();
    });
  },
  methods: {
    handleInput(e) {
      this.compareWidth = e.target.value;
      this.$emit("input", e.target.value);
    },
    handleResize() {
      const w = this.getContainerWidth();
      if (w === this.width) return;
      this.width = w;
    },
    getContainerWidth() {
      return window.getComputedStyle(this.$el, null).getPropertyValue("width");
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
:root {
  --handle-width: 42px;
  --handle-height: 42px;
  --handle-chevron-size: 20px;

  --handle-line-width: 3px;
  --handle-line-height: 100%;

  --z-index-handle: 5;
  --z-index-handle-line: 4;
  --z-index-range-input: 6;
}

.compare-wrapper {
  overflow: hidden;
  position: relative;
  object-fit: contain;
  height: 100%;
  width: 100%;
}
.compare,
.compare__content {
  position: relative;
  height: 100%;
}

.compare-overlay {
  position: absolute;
  overflow: hidden;
  height: 100%;
  top: 0;
}
.compare-overlay__content {
  position: relative;
  height: 100%;
  width: 100%;
}

.handle__arrow {
  position: absolute;
  width: var(--handle-chevron-size);
}
.handle__arrow--l {
  left: 0;
}
.handle__arrow--r {
  right: 0;
}

.handle-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 50%;
  height: 100%;
  transform: translate(-50%, -50%);
  z-index: var(--z-index-handle);
}
.handle {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background: var(--md-theme-default-primary);
  border-radius: 50%;
  width: var(--handle-width);
  height: var(--handle-height);
  opacity: 0.75;
}

.handle-line {
  content: "";
  position: absolute;
  top: 0;
  width: var(--handle-line-width);
  height: 100%;
  background: var(--md-theme-default-primary);
  z-index: var(--z-index-handle-line);
  pointer-events: none;
  user-select: none;
  opacity: 0.8;
}

.compare__range {
  position: absolute;
  cursor: ew-resize;
  left: calc(var(--handle-width) / -2);
  width: calc(100% + var(--handle-width));
  transform: translatey(-50%);
  top: calc(50%);
  z-index: var(--z-index-range-input);
  -webkit-appearance: none;
  height: 100%;
  /* debugging purposes only */
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;
}
</style>
